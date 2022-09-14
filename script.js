// При сабмите формы происходит добавление персонажа в базу (POST) и вывод в html строки с информацией о герое в таблицу. 
// Если в базе уже существует герой с таким же свойством name, то объект не добавляется в базу (можно просто в консоль вывести инфу, что юзер с таким именем уже есть в базе).

// При изменении состояния checkbox в колонке Favourite происходит изменение данных по этому персонажу в базе (PUT).
// При нажатии на кнопку Delete в строке персонажа происходит удаление с базы соответствующего героя (DELETE) и удаление соответствующей tr с таблицы.

const API = "https://631b4fb7dc236c0b1ef38778.mockapi.io";

const controller = async (path, method = "GET", body) => {
    const URL = `${API}${path}`;
    const params = {
        method,
        headers: {
            "content-type": "application/json",
        }
    }

    if (body) {
        params.body = JSON.stringify(body);
    }

    let request = await fetch(URL, params);
    let response = await request.json();
    return response;
}

// ENTER HERO

const heroesForm = document.getElementById("heroesForm");

heroesForm.addEventListener("submit", async e => {
    e.preventDefault();

    const heroName = heroesForm.querySelector("#heroName").value.toLowerCase();
    const comics = heroesForm.querySelector("#comics").value.toLowerCase();
    const favorite = heroesForm.querySelector("#favoriteCheckbox").checked;

    const heroes = await controller("/heroes");
    const hero = heroes.find(elem => elem.heroName.toLowerCase() === heroName.toLowerCase() && elem.comics.toLowerCase() === comics.toLowerCase());

    if(hero) {
        alert(`${heroName} already exist!`);
    }
    else {
        const body = {
            heroName,
            comics,
            favorite,
        };

        const response = await controller("/heroes", "POST", body);

        if(response) {
            const exemplarHero = new Hero(response);

            if (favorite) {  
                response.favorite = true;
                saveFavLocal(exemplarHero);

                alert("Add to Favorite");
            } else { 
                response.favorite = false;
            }

            exemplarHero.render();        
        }
    }    
})


// RENDER HERO

class Hero {
    constructor(heroObj) {
        for(let key in heroObj) {
            this[key] = heroObj[key]
        }
    }

    render() {
        const heroesTable = document.getElementById("heroesTable");
        const tbody = document.createElement("tbody");
        const deleteButton = document.createElement("button");
        deleteButton.innerText = "Delete";
    
        const favoriteLabel = document.createElement("label");
        const checkbox = document.createElement("input");
        
        favoriteLabel.classList.add("heroFavoriteInput");
        checkbox.setAttribute("id", "favoriteCheckbox");
        checkbox.setAttribute("type", "checkbox");
        checkbox.checked = this.favorite; 

        const tbodyList = `
            <tr>
                <td>${this.heroName}</td>
                <td>${this.comics}</td>
            </tr>
        `;
    
        const labelText = `favorite: `;
        
        tbody.innerHTML = tbodyList;
        favoriteLabel.innerHTML = labelText;
    
        heroesTable.append(tbody);
        tbody.append(favoriteLabel);
        favoriteLabel.append(checkbox);
        tbody.append(deleteButton);
    
        /// EVENTS
    
        deleteButton.addEventListener("click", async () => {
            const response = await controller(`/heroes/${this.id}`, "DELETE");
    
            if(response.id) {
                tbody.innerHTML = "";
            }
        });
    
        checkbox.addEventListener("click", async () => {
            const body = {
                heroName: this.heroName,
                comics: this.comics,
                favorite: this.favorite,
            }
    
            const response = await controller(`/heroes/${this.id}`, "PUT", body);
            console.log(response);

            if(response.favorite == true) {
                response.favorite=false;
                removeFavLocal(response.id);
                
                alert("Delete from Favorite!");
            }
            else {
                checkFavLocal(response.id);
                saveFavLocal();
                console.log("Add to Favorite!");
            }
        })
    }
};

function isHeroInLocalStorage() {
    if(localStorage.getItem("favorite")) {
        const parse = JSON.parse(localStorage.getItem("favorite"));

        return parse;
    }
    return false;
}

function checkFavLocal(id) {
    let fav =  isHeroInLocalStorage();
    if(fav) {
        return fav.some(elem => elem.id === id);
    }
    return false;
}

function saveFavLocal (exemplarHero) {
    let fav =  isHeroInLocalStorage();
    if(fav) {
        fav.push(exemplarHero);

        const strFav = JSON.stringify(fav);
        localStorage.setItem("favorite", strFav);
    } else {
        const strFav = JSON.stringify([exemplarHero]);
        localStorage.setItem("favorite", strFav);
    }
}

function removeFavLocal (id) {

    let fav = isHeroInLocalStorage();
    
    if(fav) {
        var filter = fav.filter(response => response.id !== id);

        if(filter.length) {
            localStorage.setItem("favorite", JSON.stringify(filter));

        } else {
            localStorage.setItem("favorite", "");
        }
    }

};

