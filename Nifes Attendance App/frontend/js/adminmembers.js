async function adminMembers(){
    const loading = document.getElementById("loading");
    loading.style.display = 'flex';

    const data = await getAdmin();    

    if(data){
        if(data.admin.isLoggedIn){
            links(data.admin.admin_id); 
            await overview(data.admin.admin_id);
            await memberSelect(data.admin.admin_id);
            loading.style.display = 'none';
        } else {
            mess(false, `Please Login!`);
            setTimeout(async () => {
                const res = await fetch('/auth/admin-login', { method: "GET"});
                window.location = res.url;
            }, 4000);
        }
    } else {
        mess(false, 'Unidentified user!');
        setTimeout(async () => {
            const res = await fetch('/', { method: "GET"});
            window.location = res.url;
        }, 4000);
    }
}

adminMembers();

const adminId = window.location.pathname.split('/')[2];
const memres = await fetch(`/admin/${adminId}/members`, {method: "GET"});
const data = await memres.json();
const members = data.members;


async function memberSelect(adminID){
    const memNum = document.getElementById('memnum');
    const memCon = document.getElementById('memcon');
    memCon.innerHTML = loading();

    const name = document.getElementById('searchbar').value.trim();
    const family = document.getElementById('family').value;
    const unit = document.getElementById('unit').value;

    if(memres.ok){
        if(family == 'allfamily'){
            if(unit == 'allunit'){
                memCon.innerHTML = '';
                members.forEach(user => {
                    const membercard = memCard(adminID, user);
                    memCon.append(membercard);
                });
                memNum.innerHTML = members.length;
                if(members.length == 0) memCon.innerHTML = noContent();
            }
            else {
                const filteredMembers = members.filter(user => user.unit.toLowerCase() === unit.toLowerCase());
                memCon.innerHTML = '';
                filteredMembers.forEach(user => {
                    const membercard = memCard(adminID, user);
                    memCon.append(membercard);
                });
                memNum.innerHTML = filteredMembers.length;
                if(filteredMembers.length == 0) memCon.innerHTML = noContent();
            }
        } else {
            if(unit == 'allunit'){
                const filteredMembers = members.filter(user => user.family.toLowerCase() === family.toLowerCase());
                memCon.innerHTML = '';
                filteredMembers.forEach(user => {
                    const membercard = memCard(adminID, user);
                    memCon.append(membercard);
                });
                memNum.innerHTML = filteredMembers.length;
                if(filteredMembers.length == 0) memCon.innerHTML = noContent();
            } else {
                const filteredMembers = members.filter(user => user.family.toLowerCase() === family.toLowerCase() && user.unit.toLowerCase() === unit.toLowerCase());
                memCon.innerHTML = '';
                filteredMembers.forEach(user => {
                    const membercard = memCard(adminID, user);
                    memCon.append(membercard);
                });
                memNum.innerHTML = filteredMembers.length;
                if(filteredMembers.length == 0) memCon.innerHTML = noContent();
            }
        }
    
    } else {
        memCon.innerHTML = noContent();
    }
}

const familyFilter = document.getElementById('family');
familyFilter.onchange = async () => {
    const adminID = document.getElementById('admin-id').innerHTML;
    await memberSelect(adminID);
};
const unitFilter = document.getElementById('unit');
unitFilter.onchange = async () => {
    const adminID = document.getElementById('admin-id').innerHTML;
    await memberSelect(adminID);
};

function memCard(adminID, user){
    return `
        <a class="tabledata" href="/admin/${adminID}/ad-members/details?userID=${user.id}">
            <div>
                <aside class="img">
                    <img src="${user.profileImgUrl}" alt=".">
                    <p class="imgfallback">${user.firstname.charAt(0).toUpperCase()}</p>
                </aside>
                <p>${user.surname} ${user.firstname} ${user.othername}</p>
            </div>
            <b>${user.email}</b>
            <b>${user.family}</b>
            <b>${user.unit}</b>
            <b class="tdstatus badge ${user.badge.toLowerCase()} ${badge(user.badge)}"></b>
        </a>
    `;
}

async function searchMem(){
    const adminID = document.getElementById('admin-id').innerHTML;

    const memNum = document.getElementById('memnum');
    const memCon = document.getElementById('memcon');
    memCon.innerHTML = loading();

    const name = document.getElementById('searchbar').value.trim();
    const family = document.getElementById('family');
    const unit = document.getElementById('unit');
    
    family.selectedIndex = 0;
    unit.selectedIndex = 0;

    if(name){
        const filteredMembers = members.filter(user => {
            const fullName = `${user.surname} ${user.firstname} ${user.othername}`.toLowerCase();
            return fullName.includes(name.toLowerCase());
        });
        memCon.innerHTML = '';
        filteredMembers.forEach(user => {
            const membercard = memCard(adminID, user);
            memCon.append(membercard);
        });
        memNum.innerHTML = filteredMembers.length;
        if(filteredMembers.length == 0) memCon.innerHTML = noContent();
    }
    
    
    
    
    
    searchCon.innerHTML = loading();

    if(!searchInput){
        searchCon.innerHTML = noContent();
    } else {
        try {
            const res = await fetch(`/admin/${adminID}/service?title=${searchInput}`, { method: 'GET'});
            const data = await res.json();

            if(res.ok){
                const services = data.services;
                searchNum.innerHTML = services.length;

                searchCon.innerHTML = '';
                services.forEach(serv => {
                    const servcard = servCard(serv);
                    searchCon.append(servcard);
                });
            } else{
                searchNum.innerHTML = '0';
                searchCon.innerHTML = noContent;
            }

        } catch (err) {
            if (err) throw new Error(err);
        }
    }
}


const imgInput = document.getElementById('editimg');
imgInput.onchange = (event) => {
    const edImg = document.getElementById('servimg');
    edImg.src = URL.createObjectURL(event.target.files[0]);
};

async function createService(){
    const loading = document.getElementById("loading");
    loading.style.display = 'flex';

    const adminID = document.getElementById('admin-id').innerHTML;

    // These two are confusing me     
    const imgInput = document.getElementById('editimg');

    const servTitle = document.getElementById('title').value.trim();
    const servDate = document.getElementById('date').value.trim();
    const servTime = document.getElementById('time').value.trim();
    const servDesc = document.getElementById('desc').value.trim();
    const servStartTime = document.getElementById('start').value;
    const servStopTime = document.getElementById('stop').value;

    if(servTitle&&servDate&&servTime&&servDesc&&servStartTime&&servStopTime){
        const date = new Date(servDate).toLocaleDateString('en-NG', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });

        let [hours, minutes] = servTime.split(':').map(Number);
        const meridian = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;

        const time = `${hours}:${String(minutes).padStart(2, '0')} ${meridian}`;
        const servid = String(Date.now());

        try{
            const res = await fetch(`/admin/${adminID}/create-service`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: servid,
                    title: servTitle,
                    date: date,
                    time: time,
                    imgFile: imgInput.files[0],
                    descrip: servDesc,
                    start: servStartTime,
                    stop: servStopTime,    
                })
            });
            const data = await res.json();
            if(res.ok){
                mess(true, data.message);
                setTimeout(() => {
                    adminServices();
                    loading.style.display = 'none';
                }, 4000);
            }

        } catch (error){
            if(error) throw new Error(error)
        }

    } else {
        mess(false, 'Please complete the form!')
        loading.style.display = 'none';
    }

}