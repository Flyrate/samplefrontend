function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
$(document).ready(function () {
    
    $("#login_form").on('submit', function (e){
        e.preventDefault();
        if(USERNAME === $("#username").val() && PASSWORD === $("#password").val()){
            toastr.success('You are Logined', 'Login Successful');
            $("#main_content").removeClass('d-none');
            $("#login").addClass('d-none');
            
            setCookie("login",true,0.1);
            window.location.replace("mass_mail.html");
        }
        else{
            toastr.error('Invalid Credentials','Login Failed !!!');
        }
    })
});