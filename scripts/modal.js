$('#help').on('click', function () {

    $('#screen').fadeToggle(); // toggles visibility of background screen when clicked (shows if hidden, hides if visible)

    $('.modal').fadeToggle(); // toggles visibility of background screen when clicked (shows if hidden, hides if visible)	                        

});

// Close "About this Map" modal when close button in modal is clicked
$('.modal .close-button').on('click', function () {

    $('#screen').fadeToggle(); // toggles visibility of background screen when clicked (shows if hidden, hides if visible)

    $('.modal').fadeToggle(); // toggles visibility of background screen when clicked (shows if hidden, hides if visible)	                        

});

var slideIndex = 1;
showDivs(slideIndex);

function plusDivs(n) {
    showDivs(slideIndex += n);
}

function currentDiv(n) {
    showDivs(slideIndex = n);
}

function showDivs(n) {
    var i;
    var x = document.getElementsByClassName("mySlides");
    var dots = document.getElementsByClassName("image");
    if (n > x.length) {
        slideIndex = 1
    }
    if (n < 1) {
        slideIndex = x.length
    }
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" button-on", "");
    }
    x[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].className += " button-on";
}

$(document).ready(function () {
    $("#help").click();
})
