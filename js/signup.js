$(function() {
   var userInfo;
    
    // Load the SDK asynchronously
            (function(d) {
                var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
                if (d.getElementById(id)) {
                    return;
                }
                js = d.createElement('script');
                js.id = id;
                js.async = true;
                js.src = "//connect.facebook.net/en_US/all.js";
                ref.parentNode.insertBefore(js, ref);
            }(document));
            
            var appId = (window.location.hostname === 'localhost') ? '651530078212032' : '167905743381529';
            
            window.fbAsyncInit = function() {
                FB.init({
                    appId: appId, // App ID                channelUrl: '//localhost/html/', // Channel File
                    status: true, // check login status
                    cookie: true, // enable cookies to allow the server to access the session
                    xfbml: true  // parse XFBML
                });
            };
              

            
    
    $("#play-inline").on('click', function() {
        console.log('play button clicked');
        $('.video-preview').hide();
        
        $('.video').show();
        document.getElementById('video').play();
    });

    $('#close-button').on('click', function() {
        document.getElementById('video').pause();
        $('.video').hide();
        
        $('.video-preview').show();


    });

    $('#subscribe-with-facebook').on('click', function() {
        $('#play-inline').hide();
        $('.email-in-its-place').html('Getting your info from Facebook&hellip;');
        $('#subscribe-with-facebook').hide();
        login();
    });
    
    $("#activate-now").on('click', function()
            {
                $('#activate-now').hide();
                console.log('clicked Activate Now! button');
                chrome.webstore.install(undefined,activationSuccessCallback,function(e)
            {
                console.log(e);
                $('#activate-now').show();
            });
            });
            
            function activationSuccessCallback() {
                
                $('.email-in-its-place').html('Check your '+userInfo.email+' inbox to get started!');
                $('#play-inline').show();
            }

   function login() {
                var that = this;
                var userPermissions = '';
                var friendsPermissions = '';
                var requestedPermissions;

                //FB USER PERMISSIONS	
                userPermissions += "email,";
                userPermissions += "user_birthday,";
                userPermissions += "user_relationships,";
                userPermissions += "user_likes";

                FB.login(function(response) {
                    if (response.authResponse) {
                        console.log("user logged into facebook");
                          FB.api('/me?fields=relationship_status,birthday,email,gender,name,likes', function(response) {
                   console.log("response from facebook");
                    if (response.email)
                    {
                       
                        userInfo = response;

                        userInfo.accessToken = FB.getAccessToken();
                       
                        userInfo.signupType = "facebook";
                        // Initiate sending email to the user after facebook login (ajax call)
                        $.ajax({url: "../signup",
                            data: userInfo,
                            type: "POST",
                            dataType: "JSON",
                            success: function(data)
                            {
                            console.log('success response from our signup');
                        if (data.success)
                                {
                                    
           
                                     console.log('success data from our signup');
                                     if(_extensionFound) {
                                         console.log('extension found');
                                         
                                         $('.email-in-its-place').css({'font-size':'36px !important'});
                                         $('.email-in-its-place').html('Check your '+userInfo.email+' inbox to get started!');
                                         $('#play-inline').show();
                                     } else {
                                         console.log('extension not found');
                                          $('.email-in-its-place').html('Please activate to get started&hellip;');
                                         $('#activate-now').show();
                                     }
                                   
                                }



                            }, 
                                    failure: function() {
                                console.log("failure");
                                    }
                        });
                    }
                    else
                    {
                      

                    }
                   
                });
                       
                    } else {
                        console.log("user didn't connect");
                        console.log(response);
                    }
                }, {scope: userPermissions});
            }
});