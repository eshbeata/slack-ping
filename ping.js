// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();
var morgan     = require('morgan');
var request = require('request');
var slack_token = "[your slack api token]";
var slack_team_url = "https://slack.com/api/users.list?token=";
var nexmo_sms = "https://rest.nexmo.com/sms/json?api_key=[your api key]&api_secret=[your api seceret]&";
// configure app
app.use(morgan('dev')); // log requests to the console

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port     = process.env.PORT || 3333; // set our port

// ROUTES FOR OUR API
// =============================================================================

// create our router
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
	// do logging
	console.log('Something is happening.');
	next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });	
});

// on routes that end in /bears
// ----------------------------------------------------
router.route('/slack')

	.post(function(req, res) {
  		var body = req.body;
  		var cmd = req.body.command;
  		var text = req.body.text;
  		var ping_to = text.split(" ")[0].replace("@","");
  		var ping_text = text;
  		var ping_from = req.body.user_name;
  		if(ping_from == ping_to){

  			res.json({ message: 'Are you forever alone ? why pinging your self?' });  			
  			return;
  		}
  		request(slack_team_url + slack_token, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
		    var data = JSON.parse(body); // Show the HTML for the Google homepage.
		    var team = data.members;
		    console.log(team);
		    var user_exist = false;
		    var phone = "";
		    for(var i = 0;i< team.length;i++){
		    	if(team[i].name == ping_to){
		    		phone = team[i].profile.phone;
		    		user_exist = true;
		    		break;
		    	}
		    }
		    if(user_exist){
		    	if(phone != ""){
		    		request(nexmo_sms + "&from="+ ping_from + "&to="+ phone + "&text="+ ping_text , function (nerror, nresponse, nbody) {
					  if (!nerror && nresponse.statusCode == 200) {
					  		console.log(nbody);
					  		res.json({ message: 'Pinging now !' });
					  }else{
					  	res.json({ message: 'Cant get to our SMS/CALL gateway!' });
					  }
					})
		    	}else{
		    		res.json({ message: 'User doesnt have phone number !' });
		    	}
		    }else{
		    	res.json({ message: 'Cant find user!' });
		    }

		  }else{
		  	res.json({ message: 'Cant Get user phone from slack API !' });
		  }
		})		
		
	})

	.get(function(req, res) {
		res.json({ message: 'Bear created!' });
	});


// REGISTER OUR ROUTES -------------------------------
app.use('/', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);