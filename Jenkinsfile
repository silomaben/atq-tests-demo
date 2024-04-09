pipeline {
    agent {
            node {
                label 'alpha'
            }
        }
    
    options {
        buildDiscarder logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '5', daysToKeepStr: '', numToKeepStr: '5')
    }
    
    environment {
        uiPod = ''
        cypressPod = ''
        logs = ''
        deploy = false
    }

    stages {
         

       stage('Kill pods if running') {
            steps {
                script {

                    // Initialize variables to track pod and pipeline status
                    def firstRunCompleted = false
                    def breakLoop = false
                    def podsFound = false

                    // Loop until pods are not found or for a specific number of iterations
                    def maxIterations = 5 
                    def currentIteration = 0
                    

                    while (currentIteration < maxIterations && breakLoop==false) {
                        echo "Checking pod existence and statuses..."
                        def podStatuses = checkExistence()
                        def expressAppExists = podStatuses['expressAppExists']
                        def uiAppExists = podStatuses['uiAppExists']
                        def expressAppServiceExists = podStatuses['expressAppServiceExists']
                        def uiAppServiceExists = podStatuses['uiAppServiceExists']
                        def e2eTestJobExists = podStatuses['e2eTestJobExists']
                        def podStatusesJson = podStatuses['podStatuses']






                        // Check if any pods are found
                        if (expressAppExists || uiAppExists || expressAppServiceExists || uiAppServiceExists || e2eTestJobExists || podStatusesJson.contains("Terminating")) {

                            // Delete pods only if it's the first time they are found
                            if (!firstRunCompleted) {
                                echo "Deleting pods..."
                                if (expressAppExists) {
                                    sh "kubectl delete -n filetracker deployment express-app"
                                }
                                if (uiAppExists) {
                                    sh "kubectl delete -n filetracker deployment ui-app"
                                }
                                if (expressAppServiceExists) {
                                    sh "kubectl delete -n filetracker service express-app-service"
                                }
                                if (uiAppServiceExists) {
                                    sh "kubectl delete -n filetracker service ui-app-service"
                                }
                                if (e2eTestJobExists) {
                                    sh "kubectl delete -n filetracker job e2e-test-app-job"
                                }

                                firstRunCompleted = true
                                podsFound = true
                            } else {
                                echo "Not all pods have finished terminating. Waiting 15 secs for pods to terminate..."
                                sleep 15 
                            }
                        } else {
                            echo "No running or terminating pods. Proceeding to create testing pods..."
                            breakLoop = true
                        }

                        currentIteration++
                    }

                    if (!podsFound) {
                        echo "No pods found or terminated."
                    }
                    
                }
            }
        }

        stage('Start API Pod') {
            steps {
                script {
                    echo "Starting API"
                    sh 'kubectl apply -f express-api/kubernetes'
                }
            }
        }

        
        stage('Start UI Pod') {
            steps {
                script {
                    def retries = 24
                    def delaySeconds = 15
                    def attempts = 0

                    retry(retries) {

                        attempts++

                        echo "Finding API pod... Attempt ${attempts}"

                        // Execute curl command to check if api endpoint returns successful response ... Health Check
                        def statusOutput = sh(script: 'curl -s -o /dev/null -w "%{http_code}" http://express-app-service.filetracker/students', returnStdout: true).trim()
                            
                        // Convert output to integer
                        def statusCode = statusOutput.toInteger()

                        if (statusCode == 200) {
                            echo "Found API pod. Now starting UI pod"
                            sh "kubectl apply -f ui-app/kubernetes"
                        } else {
                            echo "API pod not yet found/up. Returned status code - ${statusCode} when probed"
                            echo "Retrying in ${delaySeconds} seconds..."
                            sleep delaySeconds
                        }

                        
                        
                    }
                }
            }
        }

         stage('Get UI Pod Name') {
            steps {
                script {
                        
                        uiPod = sh(script: 'kubectl get pods -n filetracker -l app=ui-app -o jsonpath="{.items[0].metadata.name}"', returnStdout: true).trim()
                        echo "Found UI pod name: $uiPod"
                    
                }
            }
        }

        stage('Run Cypress E2E Job') {
            steps {
                script {
                    def retries = 24
                    def delaySeconds = 15
                    def attempts = 0


                    retry(retries) {

                        attempts++

                        echo "Finding UI pod...Attempt ${attempts}"
                        
                        // Execute curl command to check if api endpoint returns successful response
                        def statusOutput = sh(script: 'curl -s -o /dev/null -w "%{http_code}" http://ui-app-service.filetracker/', returnStdout: true).trim()
                            
                        // Convert output to integer
                        def statusCode = statusOutput.toInteger()


                        if (statusCode == 200) {
                            echo "Found UI. Starting Cypress Job"

                            // delete old cypress report if it exists
                            while (fileExists(uiPod,'filetracker','/shared/cypress/reports/html/index.html')) {
                                echo "Found old report. Deleting it now..."
                                sh "kubectl exec -n filetracker $uiPod -- rm /shared/cypress/reports/html/index.html"
                            }

                            
                            // sh "kubectl exec -n filetracker $uiPod -- rm -r /shared/cypress"

                            // run cypress job 
                            sh 'kubectl apply -f cypress-tests/kubernetes'

                            
                        } else {
                            echo "UI pod not yet found/up. Returned status code - ${statusCode} when probed"
                            echo "Retrying in ${delaySeconds} seconds..."
                            sleep delaySeconds
                        }
                        
                    }
                }
            }
        }


        stage('Get Cypress Job Pod Name') {
            steps {
                script {
                        cypressPod = sh(script: "kubectl get pods -n filetracker -l job-name=e2e-test-app-job -o jsonpath='{.items[0].metadata.name}'", returnStdout: true).trim()
                        echo "Found Cypress pod name: $cypressPod"
                    
                }
            }
        }

            

        stage('Wait for tests to run and generate report') {
            steps {
                script {

                    echo "Awaiting report generation"

                    waitForReport(uiPod)

                    sh "kubectl exec -n filetracker $uiPod -- cat /shared/cypress/reports/html/index.html > report_build_${env.BUILD_NUMBER}.html"
                    archiveArtifacts artifacts: "report_build_${env.BUILD_NUMBER}.html", onlyIfSuccessful: true

                }
            }
        }

        stage('Decide deployment based on test outcomes') {
            steps {
                script {

                    def logs
                    def finished = false

                    
                    
                    // Loop until "Container execution finished" is found in the logs...this is because initially logs were being printed half way
                    while (!finished) {

                        // capture logs
                        logs = sh(script: "kubectl logs -n filetracker $cypressPod -c e2e-test-app", returnStdout: true).trim()
                        
                        if (logs.contains("Container execution finished")) {
                            // Print the captured logs
                            echo "${logs}"
                            finished = true
                        } else {                            
                            sleep 5 
                        }
                    }

                    

                    if (logs.contains("All specs passed")) {
                        echo "All tests passed!"
                        deploy = true
                    } else {
                        deploy = false
                    }

                    

                    if (deploy == false){
                        error "Some tests failed. Investigate and take necessary actions... Stopping pipeline."
                    }

                }
            }
        }



        stage('Deploy') {
            steps {
                script {                 
                    if(deploy==true){
                        echo "Niiice!!! Deploying CerebriAI ATQ now."
                    } 
                }
            }
        }

        

    }

     post {
        always{
            sh "kubectl delete -n filetracker deployment express-app"
            sh "kubectl delete -n filetracker deployment ui-app"
            sh "kubectl delete -n filetracker job e2e-test-app-job"
            sh "kubectl delete -n filetracker service ui-app-service"
            sh "kubectl delete -n filetracker service express-app-service"     
        }
    }
}

def waitForReport(podName) {
    timeout(time: 5, unit: 'MINUTES') {
        script {
            def counter = 0 
            while (!fileExists(podName,'filetracker','/shared/cypress/reports/html/index.html')) {
                sh "kubectl get -n filetracker job e2e-test-app-job"
                sh "kubectl exec -n filetracker $uiPod -- ls -la /shared/cypress/reports"
                counter++ 
                echo "Waiting for index.html file to exist... (Attempt ${counter})"
                sleep 10 
            }
        }
    }
}


def fileExists(podName, namespace, filePath) {
    def command = "kubectl exec -it -n ${namespace} ${podName} -- ls ${filePath}"
    return sh(script: command, returnStatus: true) == 0
}



def checkExistence() {
        // Check if express-app deployment exists
        def expressAppExists = sh(
            script: "kubectl get -n filetracker deployment express-app >/dev/null 2>&1",
            returnStatus: true
        ) == 0


        // Check if ui-app deployment exists
        def uiAppExists = sh(
            script: "kubectl get -n filetracker deployment ui-app >/dev/null 2>&1",
            returnStatus: true
        ) == 0

        // Check if express-app-service service exists
        def expressAppServiceExists = sh(
            script: "kubectl get -n filetracker service express-app-service >/dev/null 2>&1",
            returnStatus: true
        ) == 0

        // Check if ui-app-service exists
        def uiAppServiceExists = sh(
            script: "kubectl get -n filetracker service ui-app-service >/dev/null 2>&1",
            returnStatus: true
        ) == 0

        // Check if e2e-test-app-job job exists
        def e2eTestJobExists = sh(
            script: "kubectl get -n filetracker job e2e-test-app-job >/dev/null 2>&1",
            returnStatus: true
        ) == 0

        // Get pod statuses
         def podStatuses = sh(
                        script: 'kubectl -n filetracker get all',
                        returnStdout: true
                    ).trim()
    
    

    return [expressAppExists: expressAppExists, uiAppExists: uiAppExists, 
            expressAppServiceExists: expressAppServiceExists, uiAppServiceExists: uiAppServiceExists, 
            e2eTestJobExists: e2eTestJobExists, podStatuses: podStatuses]
}
