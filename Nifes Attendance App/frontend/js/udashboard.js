async function dashboard(){
    const loading = document.getElementById("loading");
    loading.style.display = 'flex';

    const data = await getUser();    

    if(data){
        if(data.user.isLoggedIn){
            links(data.user.id);
            await userTheme(data.user.theme); 
            await topprofile(data.user);
            await overview(data.user.id, data.user.badge, data.user.consistency);
            await todayService(data.user.id);
            await attHistory(data.user.id, data.user.consistency);
            await announceTab(data.user.id);
            await birthday2day(data.user.id);
            loading.style.display = 'none';
        } else {
            mess(false, `Please Login!`);
            setTimeout(async () => {
                const res = await fetch('/auth/login', { method: "GET"});
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

dashboard();

async function todayService(userID){
    const servCon = document.getElementById('dashservice');
    servCon.innerHTML = loading();
    try{
        const res = await fetch(`/user/${userID}/todayservice`, {method: "GET"});
        const data = await res.json();


        if(res.ok){
            servCon.innerHTML = `
                <div class="dashtodayservice">
                    <a href="/user/${userID}/attendance#check-in" title="Service"><img src="${data.service.img}" alt="Service"></a>
                    <ul>
                        <li><b>Title</b>  <span>${data.service.title}</span></li>
                        <li><b>Date</b> <span>${data.service.date}</span></li>
                        <li><b>Time</b> <span>${data.service.time}</span></li>
                        <li><b>Status</b> <span class="${data.service.status.toLowerCase()}">${data.service.status.toUpperCase()}</span></li>
                    </ul>
                </div>
            `;
        } else {
            servCon.innerHTML = noContent();
        }
    } catch (err){
        if(err) throw new Error(err);
    }
}

function attHistory(consist){
    const value = document.querySelectorAll('.attvalue');
    const barvalue = document.getElementById('barvalue');

    value.innerHTML = `${consist}%`;
    barvalue.style.width = `${consist}%`;
}

async function announceTab(userID){
    const slidecon = document.getElementById('slidecon');
    slidecon.innerHTML = loading();
    
    try{
        const res = await fetch(`/user/${userID}/announcements`, {method: "GET"});
        const data = await res.json();


        if(res.ok){
            slidecon.innerHTML = '';
            for(i=0; i<data.announce.length, i++;){
                if(i < 11){
                    const divcard = card(data.announce[i]);
                    slidecon.append(divcard);
                }
            }
        } else {
            slidecon.innerHTML = noContent();
        }

    } catch (err){
        if(err) throw new Error(err);
    }
}

function card(details){
    return `
        <div class="card">
            <a href="#" title="Annoucement"><img src="${details.img}" alt="."></a>                                    
            <p class="text">
                <b>${details.title}</b>
                <span>${details.info}</span>
            </p>
        </div>
    `;
}

async function birthday2day(userID){
    const info = document.getElementById('info');
    info.innerHTML = loading();

    try{
        const res = await fetch(`/user/${userID}/birthday2day`, {method: "GET"});
        const data = await res.json();


        if(res.ok){
            info.innerHTML = '';
            for(i=0; i<data.users.length, i++;){
                const pcard = profilecard(data.users[i], 'pc1');
                info.append(pcard);
            }
        } else {
            info.innerHTML = noContent();
        }

    } catch (err){
        if(err) throw new Error(err);
    }
}

