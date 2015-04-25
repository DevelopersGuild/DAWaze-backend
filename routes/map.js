'use strict';

module.exports = function(app) {

	/*
	Res Data:
		code 					= int,
		message 				= string, 
		tags = 	[{	
				tag 			= id,
				type 			= id,
				coordinateX 	= int,
				coordinateY 	= int,
				expirationtime 	= int
				}]
	*/
	function getTag(req, res) {

	}
	
	/*
	Res Data:
		code 	= int,
		message = string, 
		tag 	= id
	*/
	function newTag(req, res) {
		var token 		= req.body.token;
		var title 		= req.body.title;
		var desc 		= req.body.narrative;
		var question	= req.body.question;
		// var tagID?

		// Check token

		// Check title length
		// Check is valid title

		// Check description length

		// Check question length

		/*
		Tag.create(title, desc, question, function(err) {
			if (err) {

				// TODO: Handle this error
				return;
			}
			
			// Success!
			// Reload map???
		});
		*/
	}

	/*
	Res Data:
		code 	= int,
		message = string, 
		tag 	= id
	*/
	function deleteTag(req, res) {
		var token = req.body.token;

		// Any checks??

		/*
		Tag.delete(function(err) {
			if (err) {
	
				// TODO: Handle this error
				return;
			}

			// Success!
			// Reload map???
		});
		*/
	}

	app.get('/v1/map', getTag);
	app.post('/v1/map/tag', newTag);
	app.delete('/v1/map/tag', deleteTag);
}