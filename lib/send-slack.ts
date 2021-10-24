import * as lambda from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';


export class SlackLambdaStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const send_slack = new lambda.Function(this, 'slackLambda', {
            description: "Send Event message to slack",
            runtime: lambda.Runtime.PYTHON_3_8,
            code: lambda.Code.fromAsset('lambda-code'),
            handler: 'app.handler'
        });

        new cdk.CfnOutput(this, 'slackLambdaOutput', {
            value: send_slack.functionName,
            description: 'The name of the s3 bucket',
            exportName: 'send_slack_func',
        });
    }
}