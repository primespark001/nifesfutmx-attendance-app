async function adminDashboard(){
    const loading = document.getElementById("loading");
    loading.style.display = 'flex';

    const data = await getAdmin();    

    if(data){
        if(data.admin.isLoggedIn){
            links(data.admin.admin_id); 
            await overview(data.admin.admin_id);
            await todayService(data.admin.admin_id);
            await services(data.admin.admin_id);
            await birthdays(data.admin.admin_id);
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

adminDashboard();

async function todayService(adminID){
    const servCon = document.getElementById('dashservice');
    servCon.innerHTML = loading();
    try{
        const res = await fetch(`/admin/${adminID}/todayservice`, {method: "GET"});
        const data = await res.json();
        const service = data.service;
        
        const members = await fetch(`/admin/${adminID}/members`, {method: "GET"});


        if(res.ok && members.ok){
            const attendNum = service.attendance.length;
            const membersNum = members.members.length;
            const rate = Math.round(((attendNum / membersNum) * 100) * 100) / 100;
            servCon.innerHTML = `
                <div class="dservice">
                    <a href="${service.img}" title="Service"><img src="${service.img}" alt="Service"></a>
                    <div>
                        <p><b>Title</b>  <span>${service.title}</span></p>
                        <p><b>Date</b> <span>${service.date}</span></p>
                        <p><b>Time</b> <span>${service.time}</span></p>
                        <p><b>Attendance</b> <span>${attendNum}/${membersNum}</span></p>
                        <p><b>Rate</b> <span>${rate}%</span></p>
                        <p><b>Status</b> <span class="${service.status.toLowerCase()}">${service.status.toUpperCase()}</span></p>
                    </div>                        
                </div>
                <a href="/admin/${adminID}/ad-services?servId=${service.id}#details" class="alast">Details</a>
            `;
        } else {
            servCon.innerHTML = noContent();
        }
    } catch (err){
        if(err) throw new Error(err);
    }
}

async function services(adminID){
    const servCon = document.getElementById('servcon');
    servCon.innerHTML = loading();
    try{
        const res = await fetch(`/admin/${adminID}/services`, {method: "GET"});
        const data = await res.json();
        const services = data.services;

        
        if(res.ok){
            servCon.innerHTML = '';
            for(i=0; i<services.length, i++;){
                const service = services[i];
                if(i<10){
                    servCon.append(`
                        <div class="dashserv">
                            <img src="${service.img}" alt="">
                            <ul>
                                <li><b>Title</b><span>${service.title}</span></li>
                                <li><b>Date</b><span>${service.date}</span></li>
                            </ul>
                            <a href="/admin/${adminID}/ad-services?servId=${service.id}#details">Details</a>
                        </div>
                    `);
                }
            }
        } else {
            servCon.innerHTML = noContent();
        }
    } catch (err){
        if(err) throw new Error(err);
    }
}

async function birthdays(adminID){
    const memcon = document.getElementById('memcon');
    memcon.innerHTML = loading();

    try{
        const res = await fetch(`/admin/${adminID}/birthday2day`, {method: "GET"});
        const data = await res.json();


        if(res.ok){
            memcon.innerHTML = '';
            for(i=0; i<data.users.length, i++;){
                const pcard = profilecard(adminID, data.users[i], 'pc1');
                memcon.append(pcard);
            }
        } else {
            memcon.innerHTML = noContent();
        }

    } catch (err){
        if(err) throw new Error(err);
    }
}

