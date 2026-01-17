async function adminMembers(){
    const loading = document.getElementById("loading");
    loading.style.display = 'flex';

    const data = await getAdmin();    

    if(data){
        if(data.admin.isLoggedIn){
            links(data.admin.admin_id); 
            await overview(data.admin.admin_id);
            await members(data.admin.admin_id);
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

async function members(adminID){
    const memNum = document.getElementById('memnum');
    const memCon = document.getElementById('memcon');
    memCon.innerHTML = loading();

    const family = document.getElementById('family').value;
    const unit = document.getElementById('unit').value;

    try{
        const res = await fetch(`/admin/${adminID}/members`, {method: "GET"});
        const data = await res.json();
        const members = data.members;

        if(res.ok){
            
        } else {
            memCon.innerHTML = noContent();
        }
    } catch (err){
        if(err) throw new Error(err);
    }
}

async function services(adminID){
    const allNum = document.getElementById('allnum');
    const allCon = document.getElementById('allcon');
    const sunNum = document.getElementById('sunnum');
    const sunCon = document.getElementById('suncon');
    const tueNum = document.getElementById('tuenum');
    const tueCon = document.getElementById('tuecon');
    const thurNum = document.getElementById('thurnum');
    const thurCon = document.getElementById('thurcon');

    allCon.innerHTML = loading();
    sunCon.innerHTML = loading();
    tueCon.innerHTML = loading();
    thurCon.innerHTML = loading();

    const searchBtn = document.getElementById('searchbtn');
    searchBtn.onclick = searchServ(adminID);

    try{
        const res = await fetch(`/admin/${adminID}/services`, {method: "GET"});
        const data = await res.json();


        if(res.ok){
            const allServ = data.services;
            const sunServ = allServ.filter(serv => serv.date.includes('Sun'));
            const tueServ = allServ.filter(serv => serv.date.includes('Tue'));
            const thurServ = allServ.filter(serv => serv.date.includes('Thu'));

            allCon.innerHTML = '';
            sunCon.innerHTML = '';
            tueCon.innerHTML = '';
            thurCon.innerHTML ='';
            
            allNum.innerHTML = allServ.length;
            sunNum.innerHTML = sunServ.length;
            tueNum.innerHTML = tueServ.length;
            thurNum.innerHTML = thurServ.length;
            
            if(allServ.length == 0) allCon.innerHTML = noContent();
            if(sunServ.length == 0) sunCon.innerHTML = noContent();
            if(tueServ.length == 0) tueCon.innerHTML = noContent();
            if(thurServ.length == 0) thurCon.innerHTML = noContent();

            allServ.forEach(serv => {
                const servcard = servCard(serv);
                allCon.append(servcard);
            });
            sunServ.forEach(serv => {
                const servcard = servCard(serv);
                sunCon.append(servcard);
            });
            tueServ.forEach(serv => {
                const servcard = servCard(serv);
                tueCon.append(servcard);
            });
            thurServ.forEach(serv => {
                const servcard = servCard(serv);
                thurCon.append(servcard);
            });            

        } else {
            allCon.innerHTML = noContent();
            sunCon.innerHTML = noContent();
            tueCon.innerHTML = noContent();
            thurCon.innerHTML = noContent();
        }

    } catch (err){
        if(err) throw new Error(err);
    }
}

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

async function searchServ(adminID){
    const searchInput = document.getElementById('dsearch').value.trim();
    const searchCon = document.getElementById('searchcon');
    const searchNum = document.getElementById('searchnum');

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

async function gotoServDetails(servID){
    const loading = document.getElementById("loading");
    loading.style.display = 'flex';

    const adminID = document.getElementById('admin-id').innerHTML;
    const res = await fetch(`/admin/${adminID}/ad-services/details?servID=${servID}`, {method: 'GET'});
    if(res.ok){
        loading.style.display = 'none';
        window.location = res.url;
    } else {
        mess(false, 'An error occured. Please try again.');
        loading.style.display = 'none';
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