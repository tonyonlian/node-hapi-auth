var Boom = require('boom');
var Bcrypt= require('bcrypt');
var User = require('./users-db');
var Joi = require('joi');


var routes = [
	{
		method:'GET',
		path:'/',
		config:{
			auth:{
				mode:'try',
				strategy:'session'
			},
			plugins:{
				'hapi-auth-cookie':{
				 	redirectTo:false
				}
			},
			handler:function(request,reply){
				if(request.auth.isAuthenticated){	
					return reply.view('profile',request.auth.credentials);
				}
				reply.view('index');
			}
		}
	},
	{
		method:'POST',
		path:'/',
		config:{
			auth:{
				mode:'try'
			},
			plugins:{
				'hapi-auth-cookie':{
					redirectTo:false
				}
			},
			validate:{
						payload:{
							account:Joi.string().required(),
							password:Joi.string().required()
						}
					},
			handler:function(request,reply){
				if(request.auth.isAuthenticated){
					return reply.view('profile');
				}
				request.server.log('info',request.payload);
				
                var account =  request.payload.account;
				var password = request.payload.password;
				
				request.server.log('info',account);
				var user = User[account];
				request.server.log('info',user);
				if(!user){
					return reply(Boom.notFound('No user registered with given credentials'));
				}
			
				return Bcrypt.compare(password,user.password,function(err,isvalid){
					if(isvalid){
						request.server.log('info','user authentication successfully');
						request.cookieAuth.set(user);
						return reply.view('profile',user);
					}
					reply.view('index');
				});
			}
		}
	},
	{
		method:'GET',
		path:'/logout',
		config:{
            auth:'session',
           
			handler:function(request,reply){
			    request.cookieAuth.clear();
				reply.view('index');
			}
		}
    },	
    {
		method:'POST',
		path:'/register',
		config:{
            auth:{
				mode:'try'
			},
			plugins:{
				'hapi-auth-cookie':{
					redirectTo:false
				}
			},
            validate:{
                   
                    payload:{
                        username:Joi.string().required(),
                        password:Joi.string().required(),
                        account:Joi.string().required(),
                    }
                },
			handler:function(request,reply){
                var params = request.payload;
                var user = User[params.account];
                if(user){
                    return reply(Boom.notFound(`the account:${params.account}  is registerd`));
                }

                user={account:params.account,username:params.account};
                user.create_date = new Date().getTime();
                Bcrypt.hash(params.password, 10, function (err, hash) {
                    user.password = hash;
                    console.log(user);
                    reply.view('index');
                });
               
                
				
			}
		}
    },
    {
		method:'get',
		path:'/register',
		config:{
            auth:{
				mode:'try'
			},
			plugins:{
				'hapi-auth-cookie':{
					redirectTo:false
				}
			},
			handler:function(request,reply){
				reply.view('register');
			}
		}
	}



]

module.exports=routes;