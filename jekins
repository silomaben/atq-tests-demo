pipeline {
    agent any
    
    options {
        buildDiscarder logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '5', daysToKeepStr: '', numToKeepStr: '5')
    }
    
    environment {
        jenkinsPod = ''
        cypressPod = ''
        logs = ''
        deploy = false
    }

    stages {
        stage('Git Checkout') {
            steps {
                script {
                    git branch: 'main',
                        url: 'https://github.com/silomaben/cypress-pipetest.git'
                }
            }
        }

       stage('Kill pods that are running') {
            steps {
                script {
                    withKubeCredentials(kubectlCredentials: [[caCertificate: '', clusterName: 'minikube', contextName: '', credentialsId: 'SECRET_TOKEN', namespace: 'default', serverUrl: 'https://192.168.49.2:8443']]) {
                        // fetch kubectl
                        sh 'curl -LO "https://storage.googleapis.com/kubernetes-release/release/v1.20.5/bin/linux/amd64/kubectl"'
                        sh 'chmod u+x ./kubectl'
                        
                        // Check if express-app deployment exists
                        def expressAppExists = sh(
                            script: "./kubectl get -n jenkins deployment express-app >/dev/null 2>&1",
                            returnStatus: true
                        ) == 0

                        // Check if ui-app deployment exists
                        def uiAppExists = sh(
                            script: "./kubectl get -n jenkins deployment ui-app >/dev/null 2>&1",
                            returnStatus: true
                        ) == 0

                        // Check if express-app-service service exists
                        def expressAppServiceExists = sh(
                            script: "./kubectl get -n jenkins service express-app-service >/dev/null 2>&1",
                            returnStatus: true
                        ) == 0

                        // Check if ui-app-service exists
                        def uiAppServiceExists = sh(
                            script: "./kubectl get -n jenkins service ui-app-service >/dev/null 2>&1",
                            returnStatus: true
                        ) == 0

                        // Check if e2e-test-app-job job exists
                        def e2eTestJobExists = sh(
                            script: "./kubectl get -n jenkins job e2e-test-app-job >/dev/null 2>&1",
                            returnStatus: true
                        ) == 0

                        // Delete deployments if they exist
                        if (expressAppExists) {
                            sh "./kubectl delete -n jenkins deployment express-app"
                        }
                        if (uiAppExists) {
                            sh "./kubectl delete -n jenkins deployment ui-app"
                        }

                        // Delete services if they exist
                        if (expressAppServiceExists) {
                            sh "./kubectl delete -n jenkins service express-app-service"
                        }
                        if (uiAppServiceExists) {
                            sh "./kubectl delete -n jenkins service ui-app-service"
                        }

                        // Delete job if it exists
                        if (e2eTestJobExists) {
                            sh "./kubectl delete -n jenkins job e2e-test-app-job"
                        }

                        // wait for pods to terminate
                        if (e2eTestJobExists || uiAppServiceExists || expressAppServiceExists) {
                            sleep 30
                        }
                    }
                }
            }                      
        }


        stage('Start API Pods') {
            steps {
                script {
                     withKubeCredentials(kubectlCredentials: [[caCertificate: '', clusterName: 'minikube', contextName: '', credentialsId: 'SECRET_TOKEN', namespace: 'default', serverUrl: 'https://192.168.49.2:8443']]) {                      
                        
                        sh './kubectl apply -f express-api/kubernetes'

                    }
                }
            }
        }

        
        stage('Run UI') {
            steps {
                script {
                    def retries = 24
                    def delaySeconds = 15
                    def attempts = 0


                    retry(retries) {

                        attempts++

                        echo "Running UI stage...Attempt ${attempts}"

                        // Inside the retry block, we'll retry the check for API status
                        withKubeCredentials(kubectlCredentials: [[caCertificate: '', clusterName: 'minikube', contextName: '', credentialsId: 'SECRET_TOKEN', namespace: 'default', serverUrl: 'https://192.168.49.2:8443']]) {
                            
                            // Execute curl command to check if api endpoint returns successful response
                            def statusOutput = sh(script: 'curl -s -o /dev/null -w "%{http_code}" http://express-app-service/students', returnStdout: true).trim()
                                
                            // Convert output to integer
                            def statusCode = statusOutput.toInteger()

                            if (statusCode == 200) {
                                sh "./kubectl apply -f ui-app/kubernetes"
                                echo "found api and started ui"
                            } else {
                                echo "API not yet up. Returned status code - ${statusCode} when probed"
                                echo "Retrying in ${delaySeconds} seconds..."
                                sleep delaySeconds
                                echo "API not up. Retry ${attempt}"
                            }
                        }
                    }
                }
            }
        }

        stage('Run cypress test') {
            steps {
                script {
                    def retries = 24
                    def delaySeconds = 15
                    def attempts = 0


                    retry(retries) {

                        attempts++

                        echo "Running Cypress tests stage...Attempt ${attempts}"

                        withKubeCredentials(kubectlCredentials: [[caCertificate: '', clusterName: 'minikube', contextName: '', credentialsId: 'SECRET_TOKEN', namespace: 'default', serverUrl: 'https://192.168.49.2:8443']]) {
                            // Execute curl command to check if api endpoint returns successful response
                            def statusOutput = sh(script: 'curl -s -o /dev/null -w "%{http_code}" http://ui-app-service/', returnStdout: true).trim()
                                
                            // Convert output to integer
                            def statusCode = statusOutput.toInteger()


                            if (statusCode == 200) {
                                echo "Found UI. Starting Cypress Job"
                                 // remove old report
                                sh 'rm -f /var/jenkins_home/html/index.html' 

                                sh './kubectl apply -f cypress-tests/kubernetes'

                                
                            } else {
                                echo "UI not yet up. Returned status code - ${statusCode} when probed"
                                echo "Retrying in ${delaySeconds} seconds..."
                                sleep delaySeconds
                                echo "UI not up. Retry ${attempt}"
                            }
                        }
                    }
                }
            }
        }


        stage('Get Pod Names') {
            steps {
                script {
                     withKubeCredentials(kubectlCredentials: [[caCertificate: '', clusterName: 'minikube', contextName: '', credentialsId: 'SECRET_TOKEN', namespace: 'default', serverUrl: 'https://192.168.49.2:8443']]) {                      
                        jenkinsPod = sh(script: './kubectl get pods -n jenkins -l app=jenkins -o jsonpath="{.items[0].metadata.name}"', returnStdout: true).trim()
                        echo "Found pod name: $jenkinsPod"
                        cypressPod = sh(script: "./kubectl get pods -n jenkins -l job-name=e2e-test-app-job -o jsonpath='{.items[0].metadata.name}'", returnStdout: true).trim()
                        echo "Found Cypress pod name: $cypressPod"
                    }
                }
            }
        }

        stage('Wait for tests to run and report generation') {
            steps {
                script {

                    withKubeCredentials(kubectlCredentials: [[caCertificate: '', clusterName: 'minikube', contextName: '', credentialsId: 'SECRET_TOKEN', namespace: 'default', serverUrl: 'https://192.168.49.2:8443']]) {
                    waitForReport()
                    sh "./kubectl exec -n jenkins $jenkinsPod -- cat /var/jenkins_home/html/index.html > report_build_${env.BUILD_NUMBER}.html"
                    archiveArtifacts artifacts: "report_build_${env.BUILD_NUMBER}.html", onlyIfSuccessful: true
                    }
                }
            }
        }
        

        stage('Deciding deployment and stopping testing pods') {
            steps {
                script {
                    withKubeCredentials(kubectlCredentials: [[caCertificate: '', clusterName: 'minikube', contextName: '', credentialsId: 'SECRET_TOKEN', namespace: 'default', serverUrl: 'https://192.168.49.2:8443']]) {

                        // Run kubectl logs command and store the output
                        logs = sh(script: "./kubectl logs -n jenkins $cypressPod -c e2e-test-app", returnStdout: true).trim()

                        // Check if the text "all specs passed" is present in the logs
                        if (logs.contains("All specs passed")) {
                            echo "All Cypress specs passed. Proceeding with deployment."
                            deploy = true
                        } else {
                             error "Some tests are failing. Please review the test report to identify and address the failures before retrying. Deployment aborted."
                        }

                        //kill the created pods and service.

                        sh "./kubectl delete -n jenkins deployment express-app"
                        sh "./kubectl delete -n jenkins deployment ui-app"
                        sh "./kubectl delete -n jenkins job e2e-test-app-job"
                        sh "./kubectl delete -n jenkins service ui-app-service"
                        sh "./kubectl delete -n jenkins service express-app-service"
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    if(deploy==true){
                        echo "Niiice!!! Deploying ATQ now."
                    } else {
                        error "Deploying aborted. Check and resolve the failing test and try again!"
                    }
                }
            }
        }

    }
}

def waitForReport() {
    timeout(time: 5, unit: 'MINUTES') {
        script {
            def counter = 0 
            while (!fileExists('/var/jenkins_home/html/index.html')) {
                counter++ 
                echo "Waiting for index.html file to exist... (Attempt ${counter})"
                sleep 10 
            }
        }
    }
}


def fileExists(filePath) {
    return sh(script: "[ -f '$filePath' ]", returnStatus: true) == 0
}