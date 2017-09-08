import swal from 'sweetalert2';
import customAlert, { otherAlert } from './exampletwo';

customAlert('message');
otherAlert('1');

const string = 'avis sur la question.';
swal(`Maxime a un ${string}`);

const array1 = [1, 2];
const array2 = [3, 4];

console.log('spread example', [
    ...array1,
    ...array2
]);

function functionAvecCallback (callback) {
    setTimeout(() => {
        callback();
    }, 1000);
}

functionAvecCallback(() => {
    console.log('callback');
});
