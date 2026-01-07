
function mess(value, dmessage){
    const mess = document.getElementById('mess');
    const red = "hsl(0, 100%, 40%)";
    const green = "hsl(120, 100%, 30%)";
    const success = "fas fa-circle-check";
    const failure = "fas fa-circle-xmark";

    if(value){
        mess.innerHTML = ` <i class="${success}"></i>
                           <span>${dmessage}</span>`;
        mess.style.color = green;
        mess.style.display = "flex";       
        
    } else {
        mess.innerHTML = ` <i class="${failure}"></i>
                           <span>${dmessage}</span>`;
        mess.style.color = red;
        mess.style.display = "flex";
    }
    clearTimeout();
    setTimeout(() => {
        mess.style.display = "none";
    }, 4000);
}

function getDaySuffix(day){
    if(day >= 11 && day <= 13) return 'th';
    
    switch(day % 10){
        case '1': return 'st';
        case '2': return 'nd';
        case '3': return 'rd';
        default: return 'th';
    }
}
async function register(){
    const loading = document.getElementById("loading");
    
    const rsurName = document.getElementById("surname").value.trim();
    const rfirstName = document.getElementById("firstname").value.trim();
    const rotherName = document.getElementById("othername").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const dateofbirth = document.getElementById("dob").value.trim();
    const family = document.getElementById("family").value.trim();
    const unit = document.getElementById("unit").value.trim();
    const faculty = document.getElementById("faculty").value.trim();
    const rdept = document.getElementById("dept").value.trim();
    const email = document.getElementById("email").value.trim();
    const pswd = document.getElementById("pswd").value;

    const surName = rsurName.charAt(0).toUpperCase() + rsurName.slice(1).toLowerCase();
    const firstName = rfirstName.charAt(0).toUpperCase() + rfirstName.slice(1).toLowerCase();
    const otherName = rotherName ? rotherName.charAt(0).toUpperCase() + rotherName.slice(1).toLowerCase() : '';
    const dob = new Date(dateofbirth).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    });   
    const dept = rdept.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    
    if(firstName&&surName&&phone&&dob&&family&&unit&&faculty&&dept&&email&&pswd){
        if(pswd.length < 8){
            mess(false, 'Password must be more than 8 characters');
        } else if(!email.includes('@')){
            mess(false, "Email must contain '@'");
        }
        else{
            try{ 
                loading.style.display = "flex";
                const res = await fetch('/auth/register', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        surname: surName,
                        firstname: firstName,
                        othername: otherName,
                        phone: phone,
                        dob: dob,
                        family: family,
                        unit: unit,
                        faculty: faculty,
                        dept: dept,
                        email: email,
                        pswd: pswd
                    })
                });
                const data = await res.json();
                
                if(res.ok){
                    mess(true, data.message);
                    setTimeout(async () => {
                        const res = await fetch(`/user/${data.user.id}/dashboard`, {method: "GET"});
                        window.location = res.url;
                    }, 4500);
                    
                } else {
                    mess(false, data.message);
                    loading.style.display = "none";
                }
            } catch(err){
                if(err) mess(false, "Server Error. Refresh the browser and try again.");
                loading.style.display = "none";
            }
        }
    } else {
        mess(false, 'Please complete the form');
    }
}

async function login(){
    const loading = document.getElementById("loading");

    const logEmail = document.getElementById("logemail").value.trim();
    const logPswd = document.getElementById("logpswd").value.trim();

    if(logEmail&&logPswd){
        try{
            const res = await fetch('/auth/login', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    logEmail: logEmail,
                    logPswd: logPswd
                })
            });
            
            loading.style.display = "flex";
            const data = await res.json();
            
            if(res.ok){
                mess(true, data.message);
                setTimeout(async () => {
                    const res = await fetch(`/user/${data.user.id}/dashboard`, {method: "GET"});
                    window.location = res.url;
                }, 4000);
                
            } else {
                mess(false, data.message);
                loading.style.display = "none";
            }
        } catch(err){
            if(err) mess(false, "Server Error. Refresh the browser and try again.");
            loading.style.display = "none";
        }
    } else {
        mess(false, 'Please complete the form');
    }
}

async function adminLogin(){
    const loading = document.getElementById("loading");
    
    const adminUsername = document.getElementById("adminlogusername").value.trim();
    const adminPswd = document.getElementById("adminlogpswd").value.trim();
    
    if(adminUsername&&adminPswd){
        loading.style.display = "flex";
        try{ 
            const res = await fetch('/auth/admin-login', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    adUsername: adminUsername,
                    adPswd: adminPswd
                })
            });            
            const data = await res.json();
            
            if(res.ok){
                mess(true, data.message);
                setTimeout(async () => {
                    const res = await fetch(`/admin/${data.admin.admin_id}/ad-dashboard`, {method: "GET"});
                    window.location = res.url;
                }, 4000);
                
            } else {
                mess(false, data.message);
                loading.style.display = "none";
            }
        } catch(err){
            if(err) mess(false, "Server Error. Refresh the browser and try again.");
            loading.style.display = "none";
        }


    } else {
        mess(false, 'Please complete the form');
    }
}

async function forgotpswd(){
    const button = event.target;

    const loading = document.getElementById("loading");
    
    const forgotpassemail = document.getElementById("forgotpassemail").value.trim();
    const displayTimer = document.getElementById("displaytimer");
    const timerValue = document.getElementById("timervalue");

    const resspass = document.getElementById("resspass");
    
    if(forgotpassemail&&forgotpassemail.includes('@')){
        loading.style.display = "flex";   
        try{
            const res = await fetch('/auth/forgot-password', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    email: forgotpassemail
                })
            });
            const data = await res.json();

            if(res.ok){
                mess(true, data.message);                
                loading.style.display = "none";

                resspass.style.display = 'flex';
                button.disabled = true;
                button.style.cursor = 'not-allowed';
                button.style.filter = 'grayscale(100%)';
                displayTimer.style.top = '1em';
                let second = 90;
                const timer = setInterval(() => {
                    second--
                    timerValue.innerHTML = String(second).padStart(2, '0');
                    button.textContent = `Resend Code in ${second}s`;
                    if(second == 0){
                        button.disabled = false;
                        button.textContent = 'Resend Code';
                        button.style.cursor = 'pointer';
                        button.style.filter = 'grayscale(0%)';
                        displayTimer.style.top = '-110%';
                        clearInterval(timer);
                    };
                }, 1000);
            } else {
                mess(false, data.message);
                loading.style.display = "none";
            }

        } catch(err){
            if(err) mess(false, "Server Error. Refresh the browser and try again.");
            loading.style.display = "none";
        }
    } else {
        mess(false, 'Please provide email!');
    }
}

function closeRessPass(){
    const resspass = document.getElementById("resspass");    
    const code = document.getElementById("code");
    const pswd = document.getElementById("pswd");
    
    code.value = '';
    pswd.value = '';
    resspass.style.display = 'none';
}

async function resetpswd(){
    const loading = document.getElementById("loading");

    const resspass = document.getElementById("resspass");

    const email = document.getElementById("forgotpassemail").value.trim();
    const code = document.getElementById("code").value.trim();
    const pswd = document.getElementById("pswd").value.trim();

    if(email&&code&&pswd){
        loading.style.display = "flex";
        try{ 
            const res = await fetch('/auth/reset-password', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    email: email,
                    code: code,
                    pswd: pswd
                })
            });

            const data = await res.json();
            
            if(res.ok){
                mess(true, data.message);
                resspass.style.display = 'none';
                setTimeout(async () => {
                    const res = await fetch(`/auth/login`, {method: "GET"});
                    window.location = res.url;
                }, 4000);
                
            } else {
                mess(false, data.message);
                loading.style.display = "none";
                resspass.style.display = 'none';
            }
        } catch(err){
            if(err) mess(false, "Server Error. Refresh the browser and try again.");
            loading.style.display = "none";
        }

    } else {
        mess(false, 'Please complete the form!');
    }
}