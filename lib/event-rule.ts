import { Stack, StackProps, App } from '@aws-cdk/core';
import * as event from '@aws-cdk/aws-events';
import * as event_target from '@aws-cdk/aws-events-targets';
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from '@aws-cdk/aws-iam';
import * as fis from '@aws-cdk/aws-fis';


export class EventRule extends Stack {
    constructor(scope: App, id: string, props?: StackProps) {
        super(scope, id, props);

        const send_slack = new lambda.Function(this, 'slackLambda', {
            description: 'Send Event message to slack',
            runtime: lambda.Runtime.PYTHON_3_8,
            code: lambda.Code.fromAsset('lambda-code/app.zip'),
            handler: 'app.handler',
            functionName: 'send-slack-spot-event'
        });

        const spot_event = new event.Rule(this, 'SpotEventRule', {
            description: 'Spot termination event rule',
            ruleName: 'spot-event',
            eventPattern: {
                source: ['aws.ec2'],
                detailType: ['EC2 Spot Instance Interruption Warning'],
                detail: {
                    'instance-action': ['terminate']
                }
            }
        });

        spot_event.addTarget(new event_target.LambdaFunction(send_slack));

        const fis_role = new iam.Role(this, 'FisRole', {
            roleName: 'spot-fis-test',
            assumedBy: new iam.ServicePrincipal('fis.amazonaws.com')
        });

        const ec2_policy_sts = new iam.PolicyStatement({
            sid: 'SpotFisTest',
            effect: iam.Effect.ALLOW,
            actions: [
                'ec2:DescribeInstances',
                'ec2:StopInstances',
                'ec2:SendSpotInstanceInterruptions'
            ],
            resources: ['arn:aws:ec2:ap-northeast-1:*:instance/*'],
            conditions: {
                'StringEquals': {'aws:RequestedRegion': props?.env?.region}
            }
        });

        fis_role.addToPolicy(ec2_policy_sts);

        const target: fis.CfnExperimentTemplate.ExperimentTemplateTargetProperty = {
            resourceType: 'aws:ec2:spot-instance',
            resourceTags: {'eks:nodegroup-name': 'eks-airflow-nodegroup-pet'},
            selectionMode: 'COUNT(1)',
            filters: [{
                path: 'State.Name',
                values: ['running']
            }]
        };

        const action: fis.CfnExperimentTemplate.ExperimentTemplateActionProperty = {
            actionId: 'aws:ec2:send-spot-instance-interruptions',
            parameters: {'durationBeforeInterruption': 'PT2M'},
            targets: {'SpotInstances': 'spot-fis-target'}
        };

        const fis_exp = new fis.CfnExperimentTemplate(this, 'FisExperiment', {
            description: 'Spot Interruption Simulate',
            roleArn: fis_role.roleArn,
            tags: {
                'Name': 'spot-interrupt-test',
                'cdk': 'fis-stack'
            },
            stopConditions: [
                {source: 'none'}
            ],
            targets: {'spot-fis-target': target},
            actions: {'send-spot-instance-interruptions': action}
        });
    }
}