async function adminServices(){
    const loading = document.getElementById("loading");
    loading.style.display = 'flex';

    const data = await getAdmin();    

    if(data){
        if(data.admin.isLoggedIn){
            links(data.admin.admin_id); 
            await overview(data.admin.admin_id);
            await todayService(data.admin.admin_id);
            await services(data.admin.admin_id);
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
            const res = await fetch('/auth/register', { method: "GET"});
            window.location = res.url;
        }, 4000);
    }
}

adminServices();

async function todayService(adminID){
    const servConLink = document.getElementById('todayservlink');
    const servCon = document.getElementById('todayserv');
    servCon.innerHTML = loading();
    try{
        const res = await fetch(`/admin/${adminID}/todayservice`, {method: "GET"});
        const data = await res.json();
        const service = data.service;

        if(res.ok){
            servConLink.href = `/admin/${adminID}/ad-services/details?servID=${service.id}`;
            servCon.innerHTML = `<img src="${service.img}" alt="Service">`;
        } else {
            servConLink.disabled = true;
            servCon.innerHTML = noContent();
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

function servCard(service){
    return `
        <div class="tabledata" onclick='gotoServDetails(${service.id})'>
            <div>
                <img src="${service.img}" alt=".">
                <p>${service.title}</p>
            </div>
            <b>${service.date}</b>
            <b>${service.time}</b>
            <b>${service.attendance.length}</b>
            <b class="tdstatus ${service.status.toLowerCase()}">${service.status.toUpperCase()}</b>
        </div>
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
        const servid = Date.now();

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