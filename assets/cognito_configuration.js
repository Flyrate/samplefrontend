import * as AWS from 'aws-sdk/global';

var authenticationData = {
	Username: $("#username").val(),
	Password: $("#password").val(),
};
var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
	authenticationData
);
var poolData = {
	UserPoolId: 'us-east-1_c4VA1uUc4', // Your user pool id here
	ClientId: 'bo5psvuvt63j0r7lbfaejlle', // Your client id here
};
var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
var userData = {
	Username: $("#username").val(),
	Pool: userPool,
};
var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
cognitoUser.authenticateUser(authenticationDetails, {
	onSuccess: function(result) {
		var accessToken = result.getAccessToken().getJwtToken();

		//POTENTIAL: Region needs to be set if not already set previously elsewhere.
		AWS.config.region = 'us-east-1';

		AWS.config.credentials = new AWS.CognitoIdentityCredentials({
			IdentityPoolId: 'us-east-1:5f5d38d7-6667-48d3-97a2-57e02134ed06', // your identity pool id here
			Logins: {
				// Change the key below according to the specific region your user pool is in.
				'cognito-idp.us-east-1.amazonaws.com/us-east-1_c4VA1uUc4': result
					.getIdToken()
					.getJwtToken(),
			},
		});

		//refreshes credentials using AWS.CognitoIdentity.getCredentialsForIdentity()
		AWS.config.credentials.refresh(error => {
			if (error) {
				console.error(error);
			} else {
				// Instantiate aws sdk service objects now that the credentials have been updated.
				// example: var s3 = new AWS.S3();
				console.log('Successfully logged!');
			}
		});
	},

	onFailure: function(err) {
		alert(err.message || JSON.stringify(err));
	},
});