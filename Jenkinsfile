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

       
         

    //    stage('Kill pods that are running') {
    //         steps {
    //             script {
                    
    //                 // Initialize a variable to track if pods were found before
    //                 def firstRunCompleted = false
    //                 def breakLoop = false
    //                 def podsFound = false

    //                 // Loop until pods are not found or for a specific number of iterations
    //                 def maxIterations = 5 // Adjust as needed
    //                 def currentIteration = 0
                    

    //                 while (currentIteration < maxIterations && breakLoop==false) {
    //                     echo "Checking pod existence and statuses..."
    //                     def podStatuses = checkExistence()
    //                     def expressAppExists = podStatuses['expressAppExists']
    //                     def uiAppExists = podStatuses['uiAppExists']
    //                     def expressAppServiceExists = podStatuses['expressAppServiceExists']
    //                     def uiAppServiceExists = podStatuses['uiAppServiceExists']
    //                     def e2eTestJobExists = podStatuses['e2eTestJobExists']
    //                     def podStatusesJson = podStatuses['podStatuses']

    //                     // echo "${podStatuses}"





    //                     // Check if any pods are found
    //                     if (expressAppExists || uiAppExists || expressAppServiceExists || uiAppServiceExists || e2eTestJobExists || podStatusesJson.contains("Terminating")) {

    //                         // Delete pods only if it's the first time they are found
    //                         if (!firstRunCompleted) {
    //                             echo "Deleting pods..."
    //                             if (expressAppExists) {
    //                                 sh "kubectl delete -n filetracker deployment express-app"
                                    
    //                             }
    //                             if (uiAppExists) {
    //                                 sh "kubectl delete -n filetracker deployment ui-app"
    //                             }
    //                             if (expressAppServiceExists) {
    //                                 sh "kubectl delete -n filetracker service express-app-service"
    //                             }
    //                             if (uiAppServiceExists) {
    //                                 sh "kubectl delete -n filetracker service ui-app-service"
    //                             }
    //                             if (e2eTestJobExists) {
    //                                 sh "kubectl delete -n filetracker job e2e-test-app-job"
    //                             }

    //                             firstRunCompleted = true
    //                             podsFound = true
    //                         } else {
    //                             echo "Not all pods have finished terminating. Waiting 15 secs for pods to terminate..."
    //                             sleep 15 // Wait for 15 seconds before checking again
    //                         }
    //                     } else {
    //                         echo "found none running so exiting loop"
    //                         breakLoop = true
    //                     }

    //                     currentIteration++
    //                 }

    //                 if (!podsFound) {
    //                     echo "No pods found or terminated."
    //                 }
                    
    //             }
    //         }
    //     }

    //     stage('Start API Pods') {
    //         steps {
    //             script {
                     
                        
    //                     sh 'kubectl apply -f express-api/kubernetes'

                    
    //             }
    //         }
    //     }

        
    //     stage('Run UI') {
    //         steps {
    //             script {
    //                 def retries = 24
    //                 def delaySeconds = 15
    //                 def attempts = 0

    //                 sh "kubectl get all -n filetracker"
    //                 // sh "kubectl logs express-app-58464b4785-pr2g5 -n filetracker"


    //                 retry(retries) {

    //                     attempts++

    //                     echo "Running UI stage...Attempt ${attempts}"

    //                     // Inside the retry block, we'll retry the check for API status
                        
                            
    //                         // Execute curl command to check if api endpoint returns successful response
    //                         def statusOutput = sh(script: 'curl -s -o /dev/null -w "%{http_code}" http://express-app-service.filetracker/students', returnStdout: true).trim()
                                
    //                         // Convert output to integer
    //                         def statusCode = statusOutput.toInteger()

    //                         if (statusCode == 200) {
    //                             sh "kubectl apply -f ui-app/kubernetes"
    //                             echo "found api and started ui"
    //                         } else {
    //                             echo "API not yet up. Returned status code - ${statusCode} when probed"
    //                             echo "Retrying in ${delaySeconds} seconds..."
    //                             sleep delaySeconds
    //                             echo "API not up. Retry ${attempt}"
    //                         }

    //                         sh 'kubectl get deployments -n filetracker'
                        
    //                 }
    //             }
    //         }
    //     }

    //     stage('Run cypress test') {
    //         steps {
    //             script {
    //                 def retries = 24
    //                 def delaySeconds = 15
    //                 def attempts = 0


    //                 retry(retries) {

    //                     attempts++

    //                     echo "Running Cypress tests stage...Attempt ${attempts}"

                        
    //                         // Execute curl command to check if api endpoint returns successful response
    //                         def statusOutput = sh(script: 'curl -s -o /dev/null -w "%{http_code}" http://ui-app-service.filetracker/', returnStdout: true).trim()
                                
    //                         // Convert output to integer
    //                         def statusCode = statusOutput.toInteger()


    //                         if (statusCode == 200) {
    //                             echo "Found UI. Starting Cypress Job"
    //                              // remove old report
    //                             sh 'rm -f /shared/cypress/reports/html/index.html' 

    //                             sh 'kubectl apply -f cypress-tests/kubernetes'

                                
    //                         } else {
    //                             echo "UI not yet up. Returned status code - ${statusCode} when probed"
    //                             echo "Retrying in ${delaySeconds} seconds..."
    //                             sleep delaySeconds
    //                             echo "UI not up. Retry ${attempt}"
    //                         }
                        
    //                 }
    //             }
    //         }
    //     }


        stage('Get Pod Names') {
            steps {
                script {
                        
                        uiPod = sh(script: 'kubectl get pods -n filetracker -l app=ui-app -o jsonpath="{.items[0].metadata.name}"', returnStdout: true).trim()
                        echo "Found pod name: $uiPod"
                        cypressPod = sh(script: "kubectl get pods -n filetracker -l job-name=e2e-test-app-job -o jsonpath='{.items[0].metadata.name}'", returnStdout: true).trim()
                        echo "Found Cypress pod name: $cypressPod"
                    
                }
            }
        }

            

        // stage('Wait for tests to run and report generation') {
        //     steps {
        //         script {

                    
        //             waitForReport(uiPod)
        //             sh "kubectl exec -it -n filetracker $uiPod -- ls -la /shared/cypress/reports"
        //             sh "kubectl exec -n filetracker $uiPod -- cat /shared/cypress/reports/html/index.html > report_build_${env.BUILD_NUMBER}.html"
        //             sh "kubectl exec -n filetracker $uiPod -- cat /shared/cypress/reports/html/index.html > report_build_${env.BUILD_NUMBER}.html"
        //             sh "kubectl exec -n filetracker $uiPod -- cat /shared/cypress/reports/html/.jsons/mochawesome.json > report_build_${env.BUILD_NUMBER}.html"
        //             archiveArtifacts artifacts: "report_build_${env.BUILD_NUMBER}.html", onlyIfSuccessful: true
                    
        //         }
        //     }
        // }

        stage('logs') {
            steps {
                script {
                    echo"logs yessir \n\n\n"
                     
                        sh "kubectl get all -n filetracker"
                        sh "kubectl exec -it -n filetracker $uiPod -- ls -la /shared/cypress"
                        sh "kubectl exec -it -n filetracker $uiPod -- ls -la /shared/cypress/reports/"
                        sh "kubectl exec -it -n filetracker $uiPod -- ls -la /shared/cypress/reports/html"
                        sh "kubectl logs -n filetracker $cypressPod -c e2e-test-app"
                        // kubectl exec -it -n filetracker e2e-test-app-job-xgwmp -- /bin/sh
                        

                    
                }
            }
        }
        

        // stage('Deciding deployment and stopping testing pods') {
        //     steps {
        //         script {
                    

        //                 // Run kubectl logs command and store the output
        //                 logs = sh(script: "kubectl logs -n filetracker $cypressPod -c e2e-test-app", returnStdout: true).trim()
        //                 echo "the logs are"


        //                 echo "${logs}"

        //                 // Check if the text "all specs passed" is present in the logs
        //                 if ( sh(script: "kubectl logs -n filetracker $cypressPod -c e2e-test-app", returnStdout: true).contains("All specs passed")) {
        //                     echo "All Cypress specs passed. Proceeding with deployment."
        //                     deploy = true
        //                 } else {
        //                      error "Some tests are failing. Please review the test report to identify and address the failures before retrying. Deployment aborted."
        //                 }

        //                 //kill the created pods and service.

        //                 sh "kubectl delete -n filetracker deployment express-app"
        //                 sh "kubectl delete -n filetracker deployment ui-app"
        //                 sh "kubectl delete -n filetracker job e2e-test-app-job"
        //                 sh "kubectl delete -n filetracker service ui-app-service"
        //                 sh "kubectl delete -n filetracker service express-app-service"
                    
        //         }
        //     }
        // }

        // stage('Deploy') {
        //     steps {
        //         script {
        //             if(deploy==true){
        //                 echo "Niiice!!! Deploying ATQ now."
        //             } else {
        //                 error "Deploying aborted. Check and resolve the failing test and try again!"
        //             }
        //         }
        //     }
        // }

    }
}

def waitForReport(podName) {
    timeout(time: 5, unit: 'MINUTES') {
        script {
            def counter = 0 
            while (!fileExists(podName,'filetracker','/shared/cypress/reports/html/index.html')) {
                sh "kubectl get all -n filetracker"
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
