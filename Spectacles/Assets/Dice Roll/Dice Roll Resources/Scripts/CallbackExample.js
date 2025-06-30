//provides an example of fucntion called from the DiceController script

//@input Component.Text textComp

var firstValue = 0;
var secondValue = 0;

script.setValue = function(v){
    firstValue = parseFloat(v);
    updateText();
}

script.setValuex10 = function(v){
    secondValue = parseFloat(v);
    updateText();
}

function updateText(){
    script.textComp.text = (firstValue + secondValue).toString();
}