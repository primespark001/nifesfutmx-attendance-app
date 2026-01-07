// Get User
async function getAdmin(){
    const adminId = window.location.pathname.split('/')[2];
    document.getElementById('admin-id').textContent = adminId;

    try{
        const res = await fetch(`/admin/${adminId}`, {method: "GET"});
        const data = await res.json();
        if(res.ok) return data;
    } catch (err){
        if(err) return err;
    }
}


// Alert Message
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

// GENERAL
// Page Links
function links(adminID){
    const links = document.querySelectorAll('.links');
    links.forEach(link => {
        link.href = `/admin/${adminID}/${link.title}`;
    });
}

// No Content
function noContent(){
    return `
        <div class="noconcard">
            <i class="nocon bi bi-ban"></i>
            <i class="nocon">No contents.</i>
        </div>
    ` ;
}
// Search Loading
function loading(){
    return `
        <div class="noconcard">
            <img src="../../resources/nifeslogo.png" alt="nifeslogo">
            <div class="rotor"></div>
        </div>
    ` ;
}

// Overview
async function overview(adminID) {
    const ovmem = document.getElementById('ovmem');
    const ovbirth = document.getElementById('ovbirth');
    const ovserv = document.getElementById('ovserv');
    const ovann = document.getElementById('ovannounce');

    try{
        const resmem = await fetch(`/admin/${adminID}/members`, {method: "GET"});
        const resbirth = await fetch(`/admin/${adminID}/birthday2day`, {method: "GET"});
        const resserv = await fetch(`/admin/${adminID}/services`, {method: "GET"});
        const resann = await fetch(`/admin/${adminID}/announcements`, {method: "GET"});
        
        const members = await resmem.json();
        const birth = await resbirth.json();
        const services = await resserv.json();  
        const announce = await resann.json();  

        
        ovmem.innerHTML = members.members.length;
        ovbirth.innerHTML = birth.birthdays.length;
        ovserv.innerHTML = services.services.length;
        ovann.innerHTML = announce.announce.length;

    } catch (err){
        if(err) throw new Error(err);
    }    
}

// function serviceDetails(service){
    
// }

function profilecard(adminID, user, type){
    return `
        <div class="profilecard ${type}" id="${user.id}">
            <img src="${user.profileImgUrl}" alt=".">
            <p class="imgfallback"><span>${user.firstname.charAt(0).toUpperCase()}</span></p>
            <i class="badge ${badge(user.badge)} ${user.badge}"></i>
            <div>
                <p class="first">
                    <b>${user.surname} ${user.firstname} ${user.othername}</b>
                    <span><span>${user.family}</span> • <span>${user.unit}</span></span>
                </p>
                <a href="/admin/${adminID}/ad-members?userID=${user.id}#details">View</a>
            </div>
        </div>
    `;
}

async function displayProfile(userID){
    const profileCon = document.getElementById('userdetails');

    const data = await getUser();

    const dob = data.user.dob.replace(/,\s\d{4}$/, '');
    const pbadge = badge(data.user.badge);
    
    profileCon.innerHTML = `
        <i class="badge ${pbadge} ${data.user.badge}"></i>
        <aside class="img">
            <img src="${data.user.profileImgUrl}" alt=".">
            <p class="imgfallback">${user.firstname.charAt(0).toUpperCase()}</p>
        </aside>
        <div class="dscroller">
            <div class="occupy"><i class="bi bi-caret-up-fill"></i></div>
            <ul>
                <li><b>Consistency</b> 
                    <h1><i class="fas fa-sync"></i> <span>${data.user.consistency}%</span></h1>
                </li>
                <li><b>Name</b>  <span>${data.user.surname} ${data.user.firstname} ${data.user.othername}</span></li>
                <li><b>Phone</b>  <span>${data.user.phone}</span></li>
                <li><b>D.O.B</b> <span>${dob}</span></li>
                <li><b>Family</b> <span>${data.user.family} family</span></li>
                <li><b>Unit</b> <span>${data.user.unit} unit</span></li>
                <li><b>Dept.</b> <span>${data.user.dept}</span></li>
            </ul>                
        </div>
    `;
}

async function logout(){
    const loading = document.getElementById("loading");
    loading.style.display = "flex";

    const userid = document.getElementById('userid').innerHTML;

    try{
        const res = await fetch(`/user/${userid}/logout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                id: userid
            })
        });

        const data = await res.json();
        
        if(res.ok){
            mess(true, data.message);
            setTimeout(async () => {
                const res = await fetch(`/auth/login`, {method: "GET"});
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
}

async function deleteAcct(){
    const loading = document.getElementById("loading");
    loading.style.display = "flex";

    const userid = document.getElementById('userid').innerHTML;

    try{
        const res = await fetch(`/user/${userid}/delete-acct`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                id: userid
            })
        });

        const data = await res.json();
        
        if(res.ok){
            mess(true, data.message);
            setTimeout(async () => {
                const res = await fetch(`/auth/login`, {method: "GET"});
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
}