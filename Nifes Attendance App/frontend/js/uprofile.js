async function profile(){
    const loading = document.getElementById("loading");
    loading.style.display = 'flex';
    
    const data = await getUser();   

    if(data){
        if(data.user.isLogin){
            links(data.user.id);
            await userTheme(data.user.theme); 
            await topprofile(data.user);
            await overview(data.user.id, data.user.badge, data.user.consistency);
            await profileSection(data.user);
            await editSection(data.user);
            await badgeSection(data.user.badge);
            loading.style.display = 'none';
        } else {
            mess(false, `Please Login!`);
            setTimeout(async () => {
                const res = await fetch('/auth/login', { method: "GET"});
                window.location = res.url;
            }, 4000);
        }
    } else if(data == err){
        mess(false, 'Server Error. Refresh the browser.');
    } else {
        mess(false, 'Unidentified user!');
        setTimeout(async () => {
            const res = await fetch('/auth/register', { method: "GET"});
            window.location = res.url;
        }, 4000);
    }
}

profile();

async function profileSection(user){
    const psecImg = document.getElementById('psecimg');
    psecImg.innerHTML = `
        <a href="${() => user.profileImgUrl ? user.profileImgUrl : '#'}" title="Profile">
            <img src="${user.profileImgUrl}" alt=".">
            <p class="imgfallback">${user.firstname.charAt(0).toUpperCase()}</p>
        </a>
    `;
    const psecpp = document.getElementById('psecpp');
    psecpp.innerHTML = `    
        <b>${user.surname} ${user.firstname} ${user.othername}</b><br>
        <span><span>${user.family}</span> • <span>${user.unit}</span></span>
    `;

    document.getElementById('psecfullname').innerHTML = `${user.surname} ${user.firstname} ${user.othername}`;
    document.getElementById('psecemail').innerHTML = user.email;
    document.getElementById('psecphone').innerHTML = user.phone;
    document.getElementById('psecdob').innerHTML = user.dob;
    document.getElementById('psecfamily').innerHTML = user.family;
    document.getElementById('psecunit').innerHTML = user.unit;
    document.getElementById('psecdept').innerHTML = user.dept;
    document.getElementById('psecfaculty').innerHTML = user.faculty;

    document.getElementById('psecprof').innerHTML = profilecard(user, 'pc1');

}

const imgInput = document.getElementById('editimg');
imgInput.onchange = (event) => {
    const edImg = document.getElementById('edsecimg');
    edImg.src = URL.createObjectURL(event.target.files[0]);
};

async function editSection(user) {
    const edImg = document.getElementById('edsecimg');
    const edInit = document.getElementById('edsecinit');
    edImg.src = user.profileImgUrl;
    edInit.innerHTML = user.firstname.charAt(0).toUpperCase();

    document.getElementById('email').value = user.email;
    document.getElementById('surname').value = user.surname;
    document.getElementById('firstname').value = user.firstname;
    document.getElementById('othername').value = user.othername;
    document.getElementById('phone').value = user.phone;

    const dob = document.getElementById('dob');
    const dobString = new Date(user.dob);
    const year = dobString.getFullYear();
    const month = String(dobString.getMonth() + 1).padStart(2, '0');
    const day = String(dobString.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    dob.value = formattedDate;

    const family = document.getElementById('family');
    const unit = document.getElementById('unit');
    const faculty = document.getElementById('faculty');

    const userFamily = Array.from(family.options).find(option => option.value === user.family);
    const userUnit = Array.from(unit.options).find(option => option.value === user.unit);
    const userFaculty = Array.from(faculty.options).find(option => option.value === user.faculty);

    userFamily.selected = userFamily ? true :  false;
    userUnit.selected = userUnit ? true :  false;
    userFaculty.selected = userFaculty ? true :  false;

    document.getElementById('dept').value = user.dept;
}

async function profileEditSave(){
    const loading = document.getElementById("loading");

    const userid = document.getElementById('userid').innerHTML;
    
    const esurName = document.getElementById("surname").value.trim();
    const efirstName = document.getElementById("firstname").value.trim();
    const eotherName = document.getElementById("othername").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const dateofbirth = document.getElementById("dob").value.trim();
    const faculty = document.getElementById("faculty").value.trim();
    const edept = document.getElementById("dept").value.trim();

    const surName = esurName.charAt(0).toUpperCase() + esurName.slice(1).toLowerCase();
    const firstName = efirstName.charAt(0).toUpperCase() + efirstName.slice(1).toLowerCase();
    const otherName = eotherName ? eotherName.charAt(0).toUpperCase() + eotherName.slice(1).toLowerCase() : '';
    const dob = new Date(dateofbirth).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    });     
    const dept = edept.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    
    if(firstName&&surName&&phone&&dob&&faculty&&dept){        
        try{ 
            loading.style.display = "flex";
            const res = await fetch(`/user/${userid}/edit-profile`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: userid,
                    surname: surName,
                    firstname: firstName,
                    othername: otherName,
                    phone: phone,
                    dob: dob,
                    faculty: faculty,
                    dept: dept,
                })
            });
            const data = await res.json();
            
            if(res.ok){
                mess(true, data.message);
                loading.style.display = "none";
                profile();
            } else {
                mess(false, data.message);
                loading.style.display = "none";
            }
        } catch(err){
            if(err) mess(false, "Server Error. Refresh the browser and try again.");
            loading.style.display = "none";
        }
    } else {
        mess(false, 'Please fill everything!');
    }
}

async function profileEditPassSave(){
    const loading = document.getElementById("loading");

    const userid = document.getElementById('userid').innerHTML;
    
    const oldpswd = document.getElementById("oldpswd").value;
    const newpswd = document.getElementById("newpswd").value;    
    
    if(oldpswd&&newpswd){    
        if(oldpswd.length < 8 || newpswd.length < 8){
            mess(false, 'Password must be more than 8 characters');
        }
        else{    
            try{ 
                loading.style.display = "flex";
                const res = await fetch(`/user/${userid}/change-password`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: userid,
                        oldpswd: oldpswd,
                        newpswd: newpswd
                    })
                });
                const data = await res.json();
                
                if(res.ok){
                    mess(true, data.message);
                    loading.style.display = "none";
                    oldpswd.value = '';
                    newpswd.value = '';
                    profile();
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
        mess(false, 'Please fill everything!');
    }
}

function badgeSection(badge){
    const memberRadio = document.getElementById("memberbadge");
    const acmemberRadio = document.getElementById("acmemberbadge");
    const stewardRadio = document.getElementById("stewardbadge");
    const acstewardRadio = document.getElementById("acstewardbadge");
    const devoteeRadio = document.getElementById("devoteebadge");

    switch (badge) {
        case 'member': memberRadio.checked = true;            
            break;    
        case 'acmember': acmemberRadio.checked = true;            
            break;    
        case 'steward': stewardRadio.checked = true;            
            break;    
        case 'acsteward': acstewardRadio.checked = true;            
            break;    
        case 'devotee': devoteeRadio.checked = true;            
            break;    
        default: memberRadio.checked = true;
            break;
    }
}