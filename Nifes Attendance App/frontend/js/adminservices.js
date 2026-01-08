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
            await servDetSec(data.admin.admin_id);
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
            servConLink.href = `/admin/${adminID}/ad-services?servID=${service.id}#details`;
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
    const teuNum = document.getElementById('teunum');
    const teuCon = document.getElementById('teucon');
    const thurNum = document.getElementById('thurnum');
    const thurCon = document.getElementById('thurcon');

    allCon.innerHTML = loading();
    sunCon.innerHTML = loading();
    teuCon.innerHTML = loading();
    thurCon.innerHTML = loading();

    const searchBtn = document.getElementById('searchbtn');
    searchBtn.onclick = searchServ(adminID);

    try{
        const res = await fetch(`/admin/${adminID}/services`, {method: "GET"});
        const data = await res.json();


        if(res.ok){
            const allServ = data.services;

            allCon.innerHTML = '';
            sunCon.innerHTML = '';
            teuCon.innerHTML = '';
            thurCon.innerHTML ='';

            // from here
            allNum.innerHTML = allServ.length;
            attNum.innerHTML = attended.length;

            const missed = allServ.length - attended.length;
            missNum.innerHTML = missed;
            
            if(attended.length == 0) attCon.innerHTML = noContent();
            if(missed == 0) missCon.innerHTML = noContent();

            for(i=0; i<allServ.length, i++;){
                if(allServ[i].status === 'closed'){
                    const servcard = attended.includes(allServ[i].id) ? servCard(allServ[i], 'attended') : servCard(allServ[i], 'missed');
                    allCon.append(servcard);
                } else if(allServ[i].status === 'active'){
                    const servcard = attended.includes(allServ[i].id) ? servCard(allServ[i], 'attended') : servCard(allServ[i], 'pending');
                    allCon.append(servcard);
                } else {
                    const servcard = servCard(allServ[i], 'pending');
                    allCon.append(servcard);
                }

                if(attended.includes(allServ[i].id)){
                    const att = servCard(allServ[i], 'attended');
                    attCon.append(att);
                } else {
                    const miss = servCard(allServ[i], 'missed');
                    missCon.append(miss);
                }
            }
        } else {
            allCon.innerHTML = noContent();
            attCon.innerHTML = noContent();
            missCon.innerHTML = noContent();
        }

    } catch (err){
        if(err) throw new Error(err);
    }
}