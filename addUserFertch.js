
const formulario = document.getElementById("userForm");//Formulario
const lista = document.getElementById("userList");//Lista
let id=0;//Id

//Funcion para pedir la peticion inicial a traves de fetch y mostrar lo que contiene nuestra api en la lista
function cargarDatos(){
    //Por defecto la nos realiza la peticion GET
    fetch('http://localhost:3000/users').then(response => response.json()).then(dato=>{
        //Dato es el array de json donde esta el contenido de nuestra API
        dato.forEach(element=>{
            const li = createListEditing(element.name, element.address, element.email, element.id);
            lista.appendChild(li);
        })
    }) 
}

//Lllamamos a la funcion para que me cargue los datos
cargarDatos();

//Cuando enviemos el formulario se ejecuta el grueso del codigo
formulario.addEventListener('submit', (e)=>{
    //Detenemos el submit
    e.preventDefault();
    //Capturamos el email para saber si existe en la API
    const emailComprobar = document.getElementById("email").value;
    if(formulario.dataset.editing){
        const name = document.getElementById("name").value;
        const address = document.getElementById("address").value;
        const telefono = document.getElementById("telf").value;
        const email = document.getElementById("email").value;
        //Solamente entrara en esta casuistica cuando pulsemos el boton editar de una lista y en 
        //la funcion editar indiquemos el .editing, osea para entender esto primero debemos mirar la funcion modifyUser

        //Capturamos el usuario, la posicion de la lista y la lista que estamos editando con .editing
        const index = parseInt(formulario.dataset.editingIndex);
        const liOld = lista.children[index];

        //Capturamos el id que tiene nuestro li para poder salvarlo (mirar la funciion createListEditing)
        //id necesario para poder identificarlo en la API
        const idList = liOld.getAttribute("value");
        const li = createListEditing(name, address, email, idList);
        const id = liOld.getAttribute("value");
        fetch('http://localhost:3000/users?id='+id).then(response=>response.json()).then(dato=>{
            if(dato.length==1){
                //Llamamos a la funcion updateUser para que se me actualice en la API y a su vez en la lista
                updateUser(name, address, email, telefono, idList, li, index)
            }else{
                alert("No se puede editar")
            }
        }).catch(err=>console.error(err))

    }else{
        fetch('http://localhost:3000/users?email='+emailComprobar).then(response=>response.json()).then(dato=>{
            if(dato.length==0){
                const name = document.getElementById("name").value;
                const address = document.getElementById("address").value;
                const telefono = document.getElementById("telf").value;
                const email = document.getElementById("email").value;
                if(validateEmail(email) && validateTelefono(telefono) && name!=""){
                    addToApi(name,address, email, telefono)
                }else{
                    alert("Datos incorrectos")
                }
            }else{
                alert("El correo ya esta en la base de dato")
            }
        }).catch(err=>console.error(err))
    }

    //En la consulta a la API con el fetch le indicamos por parametros el email que quiero que me busque, dato seria la respuesta
})

//Funcion donde validamos el email con expresiones regurales
function validateEmail(email){
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return regex.test(email);
}

//Funcion donde validamos el telefono con expresiones regulares
function validateTelefono(telefono){
    const regex = /^\+\d{2,3}\s\d{9}$/
    return regex.test(telefono);
}

//Funcion que se ejecuta cuando pulsamos el boton editar
function modifyUser(event){
    //Comprobamos que lo que pulsamos de la lista es el elemento con la clase mod
    if(event.target.classList.contains("mod")){
        //Recuperamos al padre del boton y su contenido
        const li = event.target.parentElement;
        const [name, adres, email] = li.textContent.split(":");

        //Rellenamos el formulario con ese contenido
        document.getElementById("name").value= name;
        document.getElementById("address").value= adres;
        document.getElementById("email").value= email;

        //Le indicamos al codigo que estamos editando con dataset.editing y ademas el email del usuario que
        //Estamos editando para poder capturarlo con posterioridad. Igual con el indice
        formulario.dataset.editing=email
        formulario.querySelector("button[type='submit']").textContent = "Modificar";
        formulario.dataset.editingIndex = [...lista.children].indexOf(li);
    }

}

//Funcion que nos crea un nuevo elemento li en el caso especial de estar editando
function createListEditing (name, addres, email, id, telefono){
    
    //Creamos elementos
    const li = document.createElement('li');
    const text = document.createTextNode(`${name}:${addres}:${email}:${telefono}`);
    const botonB = document.createElement('button');
    const botonM = document.createElement('button');

    //Le ponemos las clases a los botones ademas de añadirle un atrubuto al li con id que le pasamos
    //Le pasamos un id porque al estar editando necesito que este nuevo li tenga el mismo id que el li que
    //estamos editando (El atributo puede llamarse como quieras)
    botonB.classList.add("delete");
    botonM.classList.add("mod");
    li.setAttribute("value", `${id}`);
    /*
    li.setAttribute("data-userId" `${id}`,);
    li.dataset.userId*/
    botonB.textContent="Borrar";
    botonM.textContent="Modificar";

    //Añadimos el contenido y los botones al li
    li.appendChild(text);
    li.appendChild(botonB);
    li.appendChild(botonM);
    return li

}

function updateUser(name, address, email, telefono, idList, li, index){
    //Para introducirlo en la API creamos un nuevo usuario con los datos cambiados
    const newUser = {
        name: name,
        address: address,
        email: email,
        telefono: telefono
    };

    //Para actualizar usamos PUT y para identificar el usuario que estamos actualizando
    //necesitamos el id capturado anteriormente, para indcarle a fetch que estamos actualizando necesitamso
    //una cabecera donde en el body ponemos el nuevo usuario
    fetch('http://localhost:3000/users/'+idList, {
        method: 'PUT',
        body: JSON.stringify(newUser),
        headers: {'Content-type':'application/json'}
    }).then(response=>{
        //Comprobamos que el put se hizo correctamente
        if(response.ok){
           
            //Entonces es cuando remplazamos el li en la lista
            //Remplazamos el li que estabamos ditando con el nuevo editando uilizando su index
            lista.replaceChild(li, lista.children[index]);
            formulario.removeAttribute("data-editing"); 
            return response.json()
        }
    }).catch(err=>console.error(err));

}

//Funcion para crear un li normal
function createList (name, addres, email, telefono){
    const ultimoLi = document.querySelector("lista:last-child");
    if(ultimoLi!=null){
        const ultimoLi = document.querySelector("lista:last-child");
        id = li.getAttribute("value");
    }else{
        id++
    }
   
    //Creamos los elementos necesarios
    const li = document.createElement('li');
    const text = document.createTextNode(`${name}:${addres}:${email}:${telefono}:`);
    const botonB = document.createElement('button');
    const botonM = document.createElement('button');

    //Añadimos las clases y contenido a los botones
    botonB.classList.add("delete");
    botonM.classList.add("mod");
    botonB.textContent="Borrar";
    botonM.textContent="Modificar";

    //ATENCION IMPORTANTE ESTA EXPLICACION
    /*
    Para poder identificar un objeto en la API esta agrega automaticamente un id, pero este no puede 
    ser rescatado en javaScrip asi que nosotros mismos tenemos que añadirle un id al li que corresponda 
    con el id que tiene en la API. Para eso creamos una variable numerica que comience en 1 (ya que el id de las API
    empiza en 1), luego en un atributo con el nombre que queramos se lo introducimos al li y a continuacion lo aumentamos
    para la siguiente li, asi cada li que creemos tendra su id interno
    */
    if(ultimoLi!=null){
        li.setAttribute("value", `${++id}`);
    }else{
        li.setAttribute("value", `${id}`);
    }

    li.appendChild(text);
    li.appendChild(botonB);
    li.appendChild(botonM);
    return li

}

//Funcion para añadir usuario a la API
function addToApi(name, address, email, telefono){
    //Creamos un nuevo objeto con los datos recogidos
    const newUser = {
        name: name,
        address: address,
        email: email,
        telefono: telefono
    };
    //Le indicamos a fetch con la cabecera que vamos a hacer un POST y en el body le pasamos al usuario
    fetch('http://localhost:3000/users', {
        method: 'POST',
        body: JSON.stringify(newUser),
        headers: {'Content-type':'application/json'}
    }).then(response=>{
        //Comprobamos que el post se hizo correctamente para poder añadirlo a la lista
        if(response.ok){
            const list = createList(name, address, email, telefono)
            lista.appendChild(list);
            return response.json
        }
    }).catch(err=>console.error(err))
}
//Evento que se lanzara cuando nosotros pulsemos en algun ligar de la lista y las funciones se encargaran de
//saber si lo que pulse es un boton
lista.addEventListener('click', (event)=>{
    deleteUser(event);
    modifyUser(event)
})

//Funcion para borrar al usuario de la lista y de la API
function deleteUser(event){
    //Comprobamos que donde pulsamos contiene la clase delete que solo lo contiene el boton borrar
    if(event.target.classList.contains("delete")){
        //Capturamos al li del boton y el id de esa lista para identificarlo en la api
        const li = event.target.parentElement;
        const idList = li.getAttribute("value")
        fetch('http://localhost:3000/users/'+idList, {
            method: "DELETE",
            headers: {'Content-type':'application/json'}
        }).then(response=>{
            if(response.ok){
                //Como hemos borrado un elemento debemos restar tambien uno al id para que al siguiente li que
                //creemos no le ponga un id aumentado 
                lista.removeChild(li);
                return response.json()
            }
        }).catch(err=>console.error(err))
       
    }

}
