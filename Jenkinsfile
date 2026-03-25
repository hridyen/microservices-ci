pipeline {
    agent { label 'ubuntu-agent'}

    environment {
        AUTH_CHANGED   = "false"
        CONFIG_CHANGED = "false"
        LOGIN_CHANGED  = "false"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/hridyen/microservices-ci.git'
            }
        }

        stage('Detect Changes') {
            steps {
                script {

                    def changes = sh(
                        script: "git diff HEAD~1 HEAD --name-only || git show --name-only HEAD",
                        returnStdout: true
                    ).trim()

                    echo "Raw Changes Output:\n${changes}"

                    def changedFiles = changes.split("\n")

                    // reset flags
                    env.AUTH_CHANGED   = "false"
                    env.CONFIG_CHANGED = "false"
                    env.LOGIN_CHANGED  = "false"

                    for (file in changedFiles) {

                        def cleanFile = file.trim()   // 🔥 IMPORTANT FIX

                        echo "Processing file: '${cleanFile}'"

                        if (cleanFile.contains("auth-service/")) {
                            env.AUTH_CHANGED = "true"
                        }

                        if (cleanFile.contains("config-service/")) {
                            env.CONFIG_CHANGED = "true"
                        }

                        if (cleanFile.contains("login-service/")) {
                            env.LOGIN_CHANGED = "true"
                        }
                    }

                    echo "AUTH_CHANGED: ${env.AUTH_CHANGED}"
                    echo "CONFIG_CHANGED: ${env.CONFIG_CHANGED}"
                    echo "LOGIN_CHANGED: ${env.LOGIN_CHANGED}"
                }
            }
        }

        stage('Build Services') {
            parallel {

                stage('Auth Service') {
                    when {
                        expression { env.AUTH_CHANGED == "true" }
                    }
                    steps {
                        echo "Building AUTH service..."
                        sh '''
                        cd auth-service
                        docker build -t auth-service .
                        '''
                    }
                }

                stage('Config Service') {
                    when {
                        expression { env.CONFIG_CHANGED == "true" }
                    }
                    steps {
                        echo "Building CONFIG service..."
                        sh '''
                        cd config-service
                        docker build -t config-service .
                        '''
                    }
                }

                stage('Login Service') {
                    when {
                        expression { env.LOGIN_CHANGED == "true" }
                    }
                    steps {
                        echo "Building LOGIN service..."
                        sh '''
                        cd login-service
                        docker build -t login-service .
                        '''
                    }
                }
            }
        }

        stage('Run Containers') {
            steps {
                script {

                    if (env.AUTH_CHANGED == "true") {
                        sh '''
                        docker rm -f auth-container || true
                        docker run -d -p 3001:3001 --name auth-container auth-service
                        '''
                    }

                    if (env.CONFIG_CHANGED == "true") {
                        sh '''
                        docker rm -f config-container || true
                        docker run -d -p 3002:3002 --name config-container config-service
                        '''
                    }

                    if (env.LOGIN_CHANGED == "true") {
                        sh '''
                        docker rm -f login-container || true
                        docker run -d -p 3003:3003 --name login-container login-service
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline executed successfully "
        }
        failure {
            echo "Pipeline failed"
        }
    }
}