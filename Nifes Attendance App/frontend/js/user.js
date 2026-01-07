// Get Any User
async function getUser(userID){
    if(userID){
        try{
            const res = await fetch(`/user/${userID}`, {method: "GET"});
            const data = await res.json();
            if(res.ok) return data;
        } catch (err){
            if(err) return err;
        }
    } else{
        const userId = window.location.pathname.split('/')[2];
        try{
            const res = await fetch(`/user/${userId}`, {method: "GET"});
            const data = await res.json();        
            if(res.ok) return data;
        } catch (err){
            if(err) return err;
        }
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


// Theme

async function setTheme(choice){
    const userid = document.getElementById('userid').innerHTML;

    try{
        const res = await fetch(`/user/${userid}/set-theme`, {
            method : 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ id: userid, theme: choice })
        });
        const data = await res.json();

        if(res.ok){
            userTheme(choice);
            mess(true, data.message);
        } else{
            mess(false, data.message);
        }
    } catch(err){
        if(err) mess(false, `Server Error. Refresh the browser.`);
    }
}

async function userTheme(choice){
    const systemtheme = document.getElementById('system-theme');
    const lighttheme = document.getElementById('light-theme');
    const darktheme = document.getElementById('dark-theme');
    
    switch(choice){
        case 'system' :
            systemTheme();
            systemtheme.checked = true;
            break;
        case 'light' :
            document.body.classList.remove('dark');
            document.body.classList.add('light');      
            lighttheme.checked = true;
            break;                    
        case 'dark' :
            document.body.classList.remove('light');
            document.body.classList.add('dark');       
            darktheme.checked = true; 
            break;                    
    }
}

function badge(type){
    switch(type){
        case 'member':
            return 'bi bi-star-fill';
        case 'acmember':
            return 'bi bi-award-fill';
        case 'steward':
            return 'fas fa-award';
        case 'acsteward':
            return 'fas fa-medal';
        case 'devotee':
            return 'bi bi-trophy-fill';
        default: return 'bi bi-star-fill';
    }
}


// GENERAL
// Page Links
function links(userID){
    const links = document.querySelectorAll('.links');
    links.forEach(link => {
        link.href = `/user/${userID}/${link.title}`;  
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


// Top Profile
async function topprofile(user){
    const userid = document.getElementById('userid');
    const userbadge = document.getElementById('userbadge');
    const userinit = document.getElementsClassName('userinit');
    const userimg = document.getElementsClassName('userimg');
    const username = document.getElementsClassName('username');
    const userfullname = document.getElementById('userfullname');
    const useremail = document.getElementById('useremail');    
    const userfamily = document.getElementById('userfamily');
    const userunit = document.getElementById('userunit');

    const badge = badge(user.badge);
    userid.innerHTML = user.id;
    userbadge.class = `badge ${badge} ${user.badge}`;
    userinit.forEach(init => init.innerHTML = user.name.charAt(0).toUpperCase());
    userimg.forEach(img => img.url = user.imgurl);
    username.forEach(name => name.innerHTML = user.firstname);
    userfullname.innerHTML = `${user.surname} ${user.firstname} ${user.othername}`;
    useremail.innerHTML = user.email;
    userfamily.innerHTML = `${user.family} family`;
    userunit.innerHTML = `${user.unit} unit`;
}

// Overview
async function overview(userID, badge, consist) {
    const ovBadge = document.getElementById('overviewbadge');
    const ovBadgeClass = document.getElementById('overviewbadgeclass');
    const ovConsist = document.getElementById('overviewconsist');
    const ovAnnounce = document.getElementById('overviewannounce');
    const ovBirth = document.getElementById('overviewbirth');
    const ovBirthUpComing = document.getElementById('overviewbirthUpComing');
    const ov2DService = document.getElementById('overviewtodayservice');

    ovBadge.class = `mybadge ${badge} links`;
    ovBadgeClass.class = `${badge(badge)}`;
    ovConsist.innerHTML = `${consist}%`;

    try{
        const resAnn = await fetch(`/user/${userId}/announcements`, { method: 'GET'});
        const allAnnounce = await resAnn.json();

        const resTodayBirth = await fetch(`/user/${userId}/birthday2day`, { method: 'GET'});
        const tdBirth = await resTodayBirth.json();

        const resTodayServ = await fetch(`/user/${userId}/todayservice`, { method: 'GET'});
        const tdServ = await resTodayServ.json();

        const announce = allAnnounce.announce;
        const birth = tdBirth.birth;
        const service = tdServ.service;
        
        ovAnnounce.innerHTML = announce.length;
        ovBirth.innerHTML = birth.length;
        
        if(service){
            ov2DService.innerHTML = `
                <img src="${service.img}" alt=".">
                <div>
                    <b>Today's Service</b>
                    <p>${service.title}</p>
                    <i>Tap to check in</i>
                </div>
            `;
            ov2DService.style.display = 'flex';
        } else {
            ov2DService.style.display = 'none';
        }
        
        if (ovBirthUpComing) {        
            const resBirth = await fetch(`/user/${userId}/birthdayupcoming`, { method: 'GET'});
            const upcoming = await resBirth.json();
            const upcomingBirths = await upcoming.birth;
            ovBirthUpComing.innerHTML = upcomingBirths.length;
        }

    } catch (err){
        if(err) throw new Error(err);
    }    
}

function profilecard(user, type){
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
                <a href="#"><label for="profiledisplay" onclick="displayProfile('${user.id}')" >View</label></a>
            </div>
        </div>
    `;
}

async function displayProfile(userID){
    const profileCon = document.getElementById('userdetails');

    const data = await getUser(userID);

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