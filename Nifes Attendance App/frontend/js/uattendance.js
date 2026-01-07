async function attendance(){
    const loading = document.getElementById("loading");
    loading.style.display = 'flex';
    
    const data = await getUser();    

    if(data){
        if(data.user.isLogin){
            links(data.user.id);
            await userTheme(data.user.theme); 
            await topprofile(data.user);
            await overview(data.user.id, data.user.badge, data.user.consistency);
            await todayService(data.user.id);
            await chart(data.user.consistency);
            await summary(data.user.id, data.user.consistency, data.user.attended);
            await services(data.user.id, data.user.attended);            
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

attendance();

async function todayService(userID){
    const servCon = document.getElementById('atttodayservice');
    const servAction = document.getElementById('serviceactions');
    const checkIn = document.getElementById('checkinCon');

    

    try{
        const res = await fetch(`/user/${userID}/todayservice`, {method: "GET"});
        const data = await res.json();

        if(res.ok){
            const service = data.service;

            servCon.style.display = 'flex';
            servCon.innerHTML = `
                <img src="${service.img}" alt=".">
                <div>
                    <b>Today's Service</b>
                    <p>${service.title.toUpperCase()}</p>
                    <i>Tap to check in</i>
                </div>
            `;

            servAction.innerHTML = `
                <p class="servicestatus">
                    <span>Status</span>
                    <b class="${service.status.toLowerCase()}">${service.status.toUpperCase()}</b>
                </p>
                <div class="checker">
                    <label for="checkin" onclick="markAttendance('${service.id}', '${userID}')" id="checkinlabel">
                        <i class="bi bi-check-circle"></i>
                        <span>Check in</span>
                    </label>
                    <p></p>
                </div> 
            `;
            
            checkInService(service, userID);
            checkIn.innerHTML = `
                <p class="attendstatus green"><i class="far fa-check-circle"></i> Attended</p>
                ${checkservinfo(service)}
            `;

            if(service.status === 'active'){
                if(service.attendance.includes(userID)){
                    checkIn.innerHTML = `
                        <p class="attendstatus green" style="display: flex;"><i class="far fa-check-circle"></i> Attended</p>
                        ${checkservinfo(service)}
                    `;
                }
            } else if(service.status === 'closed'){
                if(service.attendance.includes(userID)){
                    checkIn.innerHTML = `
                        <p class="attendstatus green" style="display: flex;"><i class="far fa-check-circle"></i> Attended</p>
                        ${checkservinfo(service)}
                    `;
                } else {
                    checkIn.innerHTML = `
                        <p class="attendstatus red" style="display: flex;"><i class="far fa-circle-xmark"></i> Missed</p>
                        ${checkservinfo(service)} 
                    `;
                }
            }

        } else {
            servCon.style.display = 'none';
            checkIn.innerHTML = noContent();
        }
    } catch (err){
        if(err) throw new Error(err);
    }
}

async function chart(consist){
    const bar = document.querySelectorAll('.attbar');
    const barvalue = document.getElementById('attvalue');

    bar.style.height = `${consist}%`;
    barvalue.textContent = `${consist}%`;
}

async function summary(userID, consist, attended){
    const attconsist = document.getElementById('attconsist');
    const attattended = document.getElementById('attattended');
    const attmissed = document.getElementById('attmissed');
    const attserv = document.getElementById('attserv');

    try{
        const res = await fetch(`/user/${userID}/services`, {method: "GET"});
        const data = await res.json();
        if(res.ok){
            const missed = data.services.length - attended.length;
            attconsist.innerHTML = `${consist}%`;
            attattended.innerHTML = `${attended.length}`;
            attmissed.innerHTML = `${missed}`;
            attserv.innerHTML = `${data.services.length}`;
        }
    } catch (err){
        if(err) throw new Error(err);
    }
}


async function services(userID, attended){
    const allNum = document.getElementById('allnum');
    const allCon = document.getElementById('allcon');
    const attNum = document.getElementById('attnum');
    const attCon = document.getElementById('attcon');
    const missNum = document.getElementById('missnum');
    const missCon = document.getElementById('misscon');
    allCon.innerHTML = loading();
    attCon.innerHTML = loading();
    missCon.innerHTML = loading();

    const searchBtn = document.getElementById('searchbtn');
    searchBtn.onclick = searchServ(userID, attended);

    try{
        const res = await fetch(`/user/${userID}/services`, {method: "GET"});
        const data = await res.json();


        if(res.ok){
            const allServ = data.services;

            allCon.innerHTML = '';
            attCon.innerHTML = '';
            missCon.innerHTML = '';

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
                    continue;
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

async function searchServ(userID, attended){
    const value = document.getElementById('dsearch').value.trim();
    const result = document.getElementById('searchnum');
    const resultCon = document.getElementById('searchResultCon');
    resultCon.innerHTML = loading();


    if(!value){
        resultCon.innerHTML = noContent();
    } else {
        try{
            const res = await fetch(`/user/${userID}/services/${value}`, {method: "GET"});
            const data = await res.json();


            if(res.ok){
                const services = data.services;
    
                resultCon.innerHTML = '';    
                result.innerHTML = services.length;
                                
                if(services.length == 0) resultCon.innerHTML = noContent();
    
                for(i=0; i<services.length, i++;){
                    if(services[i].status === 'closed'){
                        const servcard = attended.includes(services[i].id) ? servCard(services[i], 'attended') : servCard(services[i], 'missed');
                        resultCon.append(servcard);
                    } else if(services[i].status === 'active'){
                        continue;
                    } else {
                        const servcard = servCard(allServ[i], 'pending');
                        resultCon.append(servcard);
                    }
                }
            } else {
                resultCon.innerHTML = noContent();
            }
    
        } catch (err){
            if(err) throw new Error(err);
        }
    }
}

function servCard(details, record){
    const userID = document.getElementById('userid').innerHTML;

    switch(record){
        case 'attended':            
            return `
                <div onclick="serviceDisplay('${details.id}', '${userID}')" class="tabledata" id="${details.id}">
                    <div>
                        <img src="${details.img}" alt=".">
                        <p>${details.title}</p>
                    </div>
                    <b>${details.date}</b>
                    <b>${details.time}</b>
                    <p class="record green"><i class="far fa-check-circle"></i> Attended</p>
                </div>
            `;
        case 'missed':            
            return `
                <div onclick="serviceDisplay('${details.id}', '${userID}')" class="tabledata" id="${details.id}">
                    <div>
                        <img src="${details.img}" alt=".">
                        <p>${details.title}</p>
                    </div>
                    <b>${details.date}</b>
                    <b>${details.time}</b>
                    <p class="record red"><i class="far fa-cirle-xmark"></i> Missed</p>
                </div>
            `;
        case 'pending':            
            return `
                <div onclick="serviceDisplay('${details.id}', '${userID}')" class="tabledata" id="${details.id}">
                    <div>
                        <img src="${details.img}" alt=".">
                        <p>${details.title}</p>
                    </div>
                    <b>${details.date}</b>
                    <b>${details.time}</b>
                    <p class="record pending"><i class="far fa-cirle-minus"></i> Pending</p>
                </div>
            `;
    }
}

function checkInService(service, userID){
    const check = document.getElementById('checkin');
    const label = document.getElementById('checkinlabel');

    switch(service.status){
        case 'pending':
            check.disabled = true;
            label.style.filter = 'grayscale(100%)';
            label.style.opacity = '0.6';
            label.style.cursor = 'not-allowed';
            check.checked = false;
            break;
        case 'active':
            check.disabled = false;
            label.style.filter = 'grayscale(0%)';
            label.style.opacity = '1';
            label.style.cursor = 'pointer';
            check.checked = service.attendance.includes(userID) ? true : false;
            break;
        case 'closed':
            check.disabled = true;
            label.style.filter = 'grayscale(50%)';
            label.style.opacity = '0.8';
            label.style.cursor = 'not-allowed';
            check.checked = service.attendance.includes(userID) ? true : false;
            break;
        default:
            check.disabled = true;
            label.style.filter = 'grayscale(100%)';
            label.style.opacity = '0.6';
            label.style.cursor = 'not-allowed';
            check.checked = false;
            break;
    }
}

function checkservinfo(service){
    return `
        <a href="${service.img}" title="Service"><img src="${service.img}" alt="Service"></a>
        <ul>
            <li><b>Title</b>  ${service.title}</li>
            <li><b>Date</b> ${service.date}</li>
            <li><b>Time</b> ${service.time}</li>                            
            <li><b>Status</b> <span class="${service.status.toLowerCase()}">${service.status.toUpperCase()}</span></li>                         
            <li><b>Description</b> 
                <span>${service.descrip}</span>
            </li> 
        </ul>  
    `;
}

async function markAttendance(servId, userID){
    const loading = document.getElementById("loading");
    loading.style.display = 'flex';
    
    const check = document.getElementById('checkin');
    check.checked = false;
    
    try{
        const res = await fetch(`/user/${userID}/mark-attendance`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                servId: servId,
                userId: userID
            })
        });
        const data = await res.json();
        
        if(res.ok){
            check.checked = true;
            mess(true, data.message);
            attendance();
        } else {
            loading.style.display = 'none';
            check.checked = false;
            mess(false, data.message);
        }
    } catch (err){
        if(err) throw new Error(err);
    }
}

async function serviceDisplay(servId, userID){  
    const servDet = document.getElementById('servicedetails');
    
    try {
        servDet.innerHTML = loading();

        const res = await fetch(`/user/${userID}/service?servId=${servId}`, {method: "GET"});
        const data = await res.json();

        if(res.ok){
            const service = data.service;            
            switch(service.status){
                case 'pending':                    
                    servDet.innerHTML = `
                        <p class="attendstatus green" style="display: none;"><i class="far fa-check-circle"></i> Attended</p>
                        ${servdet(service)}
                    `;
                    break;
                case 'active':
                    if(service.attendance.includes(userID)){
                        servDet.innerHTML = `
                            <p class="attendstatus green"><i class="far fa-check-circle"></i> Attended</p>
                            ${servdet(service)}
                        `;
                    } else {
                        servDet.innerHTML = `
                            <p class="attendstatus green" style="display: none;><i class="far fa-check-circle"></i> Attended</p>
                            ${servdet(service)}
                        `;
                    }
                    break;
                case 'closed':
                    if(service.attendance.includes(userID)){
                        servDet.innerHTML = `
                            <p class="attendstatus green"><i class="far fa-check-circle"></i> Attended</p>
                            ${servdet(service)}
                        `;
                    } else {
                        servDet.innerHTML = `
                            <p class="attendstatus red"><i class="far fa-circle-xmark"></i> Missed</p>
                            ${servdet(service)}
                        `;
                    }
                    break;
            }
        } else {
            mess(false, data.message);
        }

    } catch (error) {
        if(error) throw new Error(error);
    }
}

function servdet(service){
    return `
        <div class="dscroller">
            <a href="${service.img}" title="image"><img src="${service.img}" alt="."></a>
            <ul>
                <li><b>Title</b>  ${service.title}</li>
                <li><b>Date</b> ${service.date}</li>
                <li><b>Time</b> ${service.time}</li>                            
                <li><b>Status</b> <span class="${service.status.toLowerCase()}">${service.status.toUpperCase()}</span></li>                         
                <li><b>Description</b> 
                    <span>${service.descrip}</span>
                </li> 
            </ul> 
        </div>
    `;
}