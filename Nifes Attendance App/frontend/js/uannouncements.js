async function announcements(){
    const loading = document.getElementById("loading");
    loading.style.display = 'flex';
    
    const data = await getUser();    

    if(data){
        if(data.user.isLogin){
            links(data.user.id);
            await userTheme(data.user.theme); 
            await topprofile(data.user);
            await overview(data.user.id, data.user.badge, data.user.consistency);
            await allAnnouncements(data.user.id);                   
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

announcements();


async function allAnnouncements(userID){
    const announceNum = document.getElementById('announcenum');
    const announceCon = document.getElementById('announcecon');
    
    try{
        const res = await fetch(`/user/${userID}/announcements`, {method: "GET"});
        const data = await res.json();

        announceCon.innerHTML = loading();

        if(res.ok){
            const allAnnounce = data.announce;

            announceCon.innerHTML = '';
            announceNum.innerHTML = allAnnounce.length;
            
            if(allAnnounce.length == 0) {
                announceCon.innerHTML = noContent();
            } else {
                for(i=0; i<allAnnounce.length, i++;){
                    const announcecard = annCard(allAnnounce[i]);
                    announceCon.append(announcecard);
                }
            }
        } else {
            announceCon.innerHTML = noContent();
        }
    } catch (err){
        if(err) throw new Error(err);
    }
}

async function searchAnnounce(){
    const value = document.getElementById('dsearch').value.trim();
    const result = document.getElementById('searchnum');
    const resultCon = document.getElementById('searchResultCon');


    if(!value){
        resultCon.innerHTML = noContent();
    } else {
        try{
            const res = await fetch(`/user/${userID}/announcements/${value}`, {method: "GET"});
            const data = await res.json();

            resultCon.innerHTML = loading();

            if(res.ok){
                const announce = data.announce;
    
                resultCon.innerHTML = '';    
                result.innerHTML = announce.length;
                                
                if(announce.length == 0) {
                    resultCon.innerHTML = noContent();
                } else {
                    for(i=0; i<announce.length, i++;){
                        const announcecard = annCard(announce[i]);
                        resultCon.append(announcecard);
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

function annCard(details){
    return `
        <div class="card">
            <a href="${details.img}" title="Annoucement"><img src="${details.img}" alt="."></a>                                    
            <div class="text">
                <p>
                    <b>${details.title}</b>
                    <span>${details.info}</span>
                </p>
                <a href="#details" onclick="detailSec('${details.id}')">Details</a>
            </div>
        </div>
    `;
}



async function detailSec(announceId){  
    const dcon = document.getElementById('dinfo');
    const annTitle = document.querySelectorAll('.announcetitle');
    
    
    try{
        const res = await fetch(`/user/${userID}/announcement?announceId=${announceId}`, {method: "GET"});
        const data = await res.json();

        dcon.innerHTML = loading();

        if(res.ok){
            annTitle.forEach(element => {
                element.innerHTML = data.announce.title;
            })
            dcon.innerHTML = announceInfo(data.announce);            
        } else {
            dcon.innerHTML = noContent();
        }
    } catch (err){
        if(err) throw new Error(err);
    }
}
function announceInfo(detail){
    return `
        <a href="${detail.img}" title="Annoucement"><img src="${detail.img}" alt="."></a>                                    
        <div class="text">
            <b>${detail.title}</b>
            <p>${detail.info}</p>
        </div>
        <div class="description">
            <b>Description</b>
            <p>${detail.descrip}</p>
        </div>
    `;
}