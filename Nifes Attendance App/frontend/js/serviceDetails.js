async function serviceDetails(){
    const loading = document.getElementById("loading");
    loading.style.display = 'flex';

    const data = await getAdmin();    

    if(data){
        if(data.admin.isLoggedIn){
            links(data.admin.admin_id);
            await servDetails(data.admin.admin_id);
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

serviceDetails();

async function servDetails(adminID){
    const params = new URLSearchParams(window.location.search);
    const serviceID = params.get(servID);
    
    const serviceCon = document.getElementById('dservice');
    serviceCon.innerHTML = loading();

    const delBtn = document.getElementById('delbtn');
    delBtn.onclick = deleteService(adminID, serviceID);
    
    try{
        
        const res = await fetch(`/admin/${adminID}/service?servID=${serviceID}`, {method: 'GET'});
        const data = await res.json();
        const service = data.service;        
        
        if(res.ok){
            const membersRes = await fetch(`/admin/${adminID}/members/total`, {method: 'GET'});
            const membersData = membersRes.json();
            const totalMembers = membersData.members.length;

            const rate = Math.round(((service.attendance.length / totalMembers) * 100) * 100) / 100;
            serviceChart(rate);
            await servMembers(adminID, service.attendance);

            serviceCon.innerHTML  = serviceInfo(service, totalMembers, rate);
        } else {
            serviceCon.innerHTML = noContent();
        }

    } catch (err){
        if(err) throw new Error(err);
    }
}

function serviceInfo(service, totalMembers, rate){
    return `
        <a href="${service.img}" title="Service"><img src="${service.img}" alt="Service"></a>
        <div>
            <p><b>Title</b>  <span>${service.title}</span></p>
            <p><b>Date</b> <span>${service.date}</span></p>
            <p><b>Time</b> <span>${service.time}</span></p>
            <p><b>Attendance</b> <span>${service.attendance.length}/${totalMembers}</span></p>
            <p><b>Rate</b> <span>${rate}%</span></p>
            <p><b>Status</b> <span class="${service.status.toLowerCase()}">${service.status.toUpperCase()}</span></p>
        </div>
        <div>
            <p><b>Description</b> 
                <span>${service.descrip}</span>
            </p>
        </div>
    `;
}

function serviceChart(rate){
    const bar = document.getElementById('bar');
    const barvalue = document.getElementById('barvalue');

    bar.style.height = `${rate}%`;
    barvalue.style.height = `${rate}%`;
    barvalue.textContent = `${rate}%`;
}

async servMembers(adminID, membersIds){
    const totalNum = document.getElementById('totalnum');
    const totalCon = document.getElementById('totalcon');
    const searchBtn = document.getElementById('searchattendmembers');
    
    let members = [];
    totalNum..innerHTML = membersIds.length;
    membersIds.forEach(userID => {
        try{
            const res = await fetch(`/admin/${adminID}/member/${userID}`, {method: 'GET'});
            const data = res.json();
            if(res.ok){
                const user = data.user;
                const profile = profilecard(adminID, user, 'pc2')
                totalCon.append(profile);
                members.push(profile);
            }
        } catch (error){
            if(err) throw new Error(error);
        }   
    
    });

    serachBtn.onclick = searchAttMem(adminID, members);

}

function searchAttMem(adminID, memebrs){
    const input = document.getElementById('dmsearch');
    const resultNum = document.getElementById('resultnum');
    const resultCon = document.getElementById('resultcon');

    const name  = input.value.trim();

    resultCon.innerHTML = loading();
    if(name){
        resultCon.innerHTML = ''
        const result = members.filter(user =>
            user.surname.includes(name) ||
            user.firstname.includes(name) ||
            user.othername.includes(name)
        });
        if(result){
            result.forEach(user => {
                const profile = profilecard(adminID, user, 'pc2')
                resultCon.append(profile);    
            });
            resultNum.innerHTML = result.length;
        } else {
            resultCon.innerHTML = noContent();
            resultNum.innerHTML = '0';
        }
    } else {
        mess(false, "Enter member's name");
        resultCon.innerHTML = noContent();
    }    
}

async function deleteService(adminId, servId) {
    const loading = document.getElementById("loading");
    loading.style.display = 'flex';    

    try {
        const res = await fetch(`/admin/${adminID}/delete-service`, {
            method: 'DELETE',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                adminID: adminId,
                servID: servId
            })
        });
        const data = awair res.json();
        if(res.ok){
            mess(true, data.message);
            loading.style.display = 'none';
        } else{
            mess(false, data.message);
            loading.style.display = 'none';
        }
    } catch (error) {
        if(error) throw new Error(error); 
        loading.style.display = 'none';       
    }
}