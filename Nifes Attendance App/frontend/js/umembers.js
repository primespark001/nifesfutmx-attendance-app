async function members(){
    const loading = document.getElementById("loading");
    loading.style.display = 'flex';
    
    const data = await getUser();    

    if(data){
        if(data.user.isLogin){
            links(data.user.id);
            userTheme(data.user.theme); 
            topprofile(data.user);
            overview(data.user.id, data.user.badge, data.user.consistency);
            birthdays(data.user.id);            
            membersSection(data.user.id, data.user.family, data.user.unit);
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

members();

async function birthdays(userID){
    const birthToday = document.getElementById('birthtoday');
    const birthUpComing = document.getElementById('birthUpComing');

    try{
        const resBirth2day = await fetch(`/user/${userID}/birthday2day`, {method: "GET"});
        const resBirthUpComing = await fetch(`/user/${userID}/birthdayupcoming`, {method: "GET"});

        const today = await resBirth2day.json();
        const upcoming = await resBirthUpComing.json();

        birthToday.innerHTML = loading();
        birthUpComing.innerHTML = loading();

        if(resBirth2day.ok && resBirthUpComing.ok){
            birthToday.innerHTML = '';
            birthUpComing.innerHTML = '';

            for(i=0; i<today.users.length, i++;){
                const pcard = profilecard(today.users[i], 'pc1');
                birthToday.append(pcard);
            }
            for(i=0; i<upcoming.users.length, i++;){
                const pcard = profilecard(upcoming.users[i], 'pc1');
                birthUpComing.append(pcard);
            }

        } else {
            birthToday.innerHTML = noContent();
            birthUpComing.innerHTML = noContent();
        }
    } catch (err){
        if(err) throw new Error(err);
    }
}


async function membersSection(userID, family, unit, faculty){
    const familyNum = document.getElementById('familynum');
    const familyCon = document.getElementById('familycon');
    const unitNum = document.getElementById('unitnum');
    const unitCon = document.getElementById('unitcon');
    const facultyNum = document.getElementById('facultynum');
    const facultyCon = document.getElementById('facultycon');

    const searchBtn = document.getElementById('searchbtn');
    searchBtn.onclick = searchMem(`${userID}`);

    try{
        const res = await fetch(`/user/${userID}/members?ufamily=${family}&uunit=${unit}&ufaculty=${faculty}`, {method: "GET"});
        const data = await res.json();

        familyCon.innerHTML = loading();
        unitCon.innerHTML = loading();
        facultyCon.innerHTML = loading();

        if(res.ok){
            const myfamily = data.familyMem;
            const myunit = data.unitMem;
            const myfaculty = data.facultyMem;

            familyCon.innerHTML = '';
            unitCon.innerHTML = '';
            facultyCon.innerHTML = '';

            familyNum.innerHTML = `${family} Family: ${myfamily.length}`;
            unitNum.innerHTML = `${unit} Unit: ${myunit.length}`;
            facultyNum.innerHTML = `${faculty}: ${myfaculty.length}`;
            
            if(myfamily.length == 0) familyCon.innerHTML = noContent();
            if(myunit == 0) unitCon.innerHTML = noContent();
            if(myfaculty == 0) facultyCon.innerHTML = noContent();

            for(i=0; i<myfamily.length, i++;){
                const pcard = profilecard(myfamily[i], 'pc2');
                familyCon.append(pcard);
            }
            for(i=0; i<myunit.length, i++;){
                const pcard = profilecard(myunit[i], 'pc2');
                unitCon.append(pcard);
            }
            for(i=0; i<myfacultylength, i++;){
                const pcard = profilecard(myfaculty[i], 'pc2');
                facultyCon.append(pcard);
            }

        } else {
            familyCon.innerHTML = noContent();
            unitCon.innerHTML = noContent();
            facultyCon.innerHTML = noContent();
        }

    } catch (err){
        if(err) throw new Error(err);
    }
}

async function searchMem(userID){
    const value = document.getElementById('dsearch').value.trim();
    const result = document.getElementById('searchnum');
    const resultCon = document.getElementById('searchResultCon');


    if(!value){
        resultCon.innerHTML = noContent();
    } else {
        try{
            const res = await fetch(`/user/${userID}/members/${value}`, {method: "GET"});
            const data = await res.json();

            resultCon.innerHTML = loading();

            if(res.ok){
                const members = data.members;
    
                resultCon.innerHTML = '';    
                result.innerHTML = members.length;
                                
                if(members.length == 0) resultCon.innerHTML = noContent();
    
                for(i=0; i<members.length, i++;){
                    const pcard = profilecard(members[i], 'pc2');
                    familyCon.append(pcard);
                }
            } else {
                resultCon.innerHTML = noContent();
            }
    
        } catch (err){
            if(err) throw new Error(err);
        }
    }
}
