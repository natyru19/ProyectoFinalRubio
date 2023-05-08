let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let contenedor = document.getElementById("misProds");
let tabla = document.getElementById("tablaCarrito");
let realizarCompraBtn = document.getElementById("realizarCompra");

//API
let dolarVenta;
obtenerDolar();

//JSON
let productos;
obtenerJSON();

//En caso que haya un carrito abandonado
carrito.length != 0 && crearTabla();

//Luxon
const DateTime = luxon.DateTime;
const inicio = DateTime.now();

//Creo la tabla si hay algo en el storage al comienzo.
function crearTabla() {
  for (const producto of carrito) {
    document.getElementById("tablaCarrito").innerHTML += `
      
        <tr>            
            <td><img src=${producto.imagen} style= "height: 50px; width: 50px"></td>            
            <td>${producto.nombre}</td>
            <td>${producto.precio}</td>            
            <td><button id=${producto.id} class="btn btn-light" onclick="eliminar(event)">❌</button></td>
        </tr>
    `;
  }

  totalCompra = carrito.reduce(
    (acumulador, producto) => acumulador + producto.precio,
    0
  );

  let infoTotal = document.getElementById("total");
  infoTotal.innerText = "Total a pagar u$: " + totalCompra;
  //Se evalúa si el dolar venta está disponible.
  let aPagarPesos = totalCompra * dolarVenta || "   realizando conversion ...";
  infoTotal.innerText += "   Total a pagar $:" + aPagarPesos;
  //Aguardo a que llegue la información.
  setTimeout(() => {
    let aPagarPesos =
      totalCompra * dolarVenta ||
      "   Total a pagar $: realizando conversion ...";
    infoTotal.innerText =
      "Total a pagar u$: " +
      totalCompra +
      " -" +
      " Total a pagar $: " +
      aPagarPesos;
  }, 2000);
}

function mostrarProds() {
  for (const producto of productos) {
    contenedor.innerHTML += `
        <div class="card col-md-3">
            <img src=${producto.imagen} class="card-img-top" alt="Imagen del producto">
            <div class="card-body">                                
                <p class="card-text">${producto.nombre}</p>
                <p class="card-text">$ ${producto.precio}</p>
                <p class="card-text">${producto.descripcion}</p>
                <button id='btn${producto.id}' class="btn btn-primary align-bottom">Agregar al carrito</button>
            </div>
        </div>   
        `;
  }

  //EVENTOS
  productos.forEach((producto) => {
    document
      .getElementById(`btn${producto.id}`)
      .addEventListener("click", () => {
        agregarProd(producto);
      });
  });
}

function agregarProd(prodAAgregar) {
  carrito.push(prodAAgregar);

  //Se agrega sweet alert.
  Swal.fire("Se agregó al carrito", `${prodAAgregar.nombre}.`, "success");

  //Se agrega una fila a la tabla del carrito.
  document.getElementById("tablaCarrito").innerHTML += `
        <tr>   
            <td><img src=${prodAAgregar.imagen} style= "height: 50px; width: 50px"></td>                    
            <td>${prodAAgregar.nombre}</td>
            <td>${prodAAgregar.precio}</td>            
            <td><button id=${prodAAgregar.id} class="btn btn-light" onclick="eliminar(event)">❌</button></td>
        </tr>
    `;

  //Incrementar el total
  let totalCompra = carrito.reduce(
    (acumulador, producto) => acumulador + producto.precio,
    0
  );

  document.getElementById("total").innerText =
    "Total a pagar $: " +
    totalCompra +
    "   Total a pagar $: " +
    totalCompra * dolarVenta;

  //Storage
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

//Elimino los productos del carrito.
function eliminar(ev) {
  let fila = ev.target.parentElement.parentElement;
  let id = fila.children[0].innerText;
  let indice = carrito.findIndex((producto) => producto.id == id);

  //Quita el producto del carrito.
  carrito.splice(indice, 1);
  //Quita la fila de la tabla.
  fila.remove();
  //Se recalcula el total.
  let preciosAcumulados = carrito.reduce(
    (acumulador, producto) => acumulador + producto.precio,
    0
  );
  total.innerText = "Total a pagar u$: " + preciosAcumulados;

  //Storage
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

realizarCompraBtn.onclick = () => {
  if (carrito != 0) {
    carrito = [];
    document.getElementById("tablaCarrito").innerHTML = "";
    document.getElementById("total").innerText = "";

    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "La compra fue realizada.",
      showConfirmButton: false,
      timer: 2500,
    });

    //Nuevo Storage
    localStorage.removeItem("carrito");
  } else {
    document.getElementById("total").innerText =
      "Aún no se ha seleccionado ningún producto, puede comenzar a comprar!";
  }
};

//Se crea un evento para vaciar el carrito
let vaciarCarritoBtn = document.getElementById("vaciarCarrito");
vaciarCarritoBtn.addEventListener("click", eliminarCarrito);

function eliminarCarrito() {
  carrito.removeItem;
  carrito = [];
  document.getElementById("tablaCarrito").innerHTML = "";
  document.getElementById("total").innerText = "";
  //Nuevo Storage
  localStorage.removeItem("carrito");
  document.getElementById("total").innerText = "El carrito está vacío.";
}

//API
function obtenerDolar() {
  const URLDOLAR = "https://api.bluelytics.com.ar/v2/latest";
  fetch(URLDOLAR)
    .then((respuesta) => respuesta.json())
    .then((datos) => {
      const dolarBlue = datos.blue;
      document.getElementById("infoDolarBlue").innerHTML += `
                <p>Dolar compra: $ ${dolarBlue.value_buy} - Dolar venta: $ ${dolarBlue.value_sell}</p>
            `;
      dolarVenta = dolarBlue.value_sell;
    });
}

//JSON
async function obtenerJSON() {
  const URLJSON = "/productos.json";
  const respuesta = await fetch(URLJSON);
  const data = await respuesta.json();
  productos = data;
  //Ya tengo los productos, entonces llamo a la función para mostrarlos
  mostrarProds();
}
