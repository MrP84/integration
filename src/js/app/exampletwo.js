import swal from 'sweetalert2';

export default function () {
    setTimeout(() => {
        swal('Seconde alerte après 5 secondes');
    }, 5000);
}
