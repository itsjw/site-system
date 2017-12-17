$( document ).ready(function() {
  $('.my-pagination > button').click(function () {
    var elementOnClick = $(this).attr('element-slide');
    var elements = $('.my-pagination > button').length - 2;
    var active = Number($('.my-pagination > button.active').attr('element-slide'));
    function changeTablet (active) {
      $('.my-pagination > button').addClass('btn-default').removeClass('btn-success').removeClass('active');
      $('.my-pagination > button[element-slide='+active+']').removeClass('btn-default').addClass('btn-success').addClass('active');
      $('.tablet').addClass('hide');
      $('.tablet[element-slide='+active+']').removeClass('hide');
    }
    
    if (elementOnClick == 'next') {
      active += 1;
      if (active == elements + 1) {active = 1};
      changeTablet(active);
    } else if (elementOnClick == 'prev') {
      active -= 1;
      if (active < 1) {active = elements};
      changeTablet(active);
    } else {
      active = elementOnClick;
      changeTablet(active);
    }
  })
  
  $('.document-btn').click(function () {
    $('.tablet-0').toggleClass('hide');
  })
  
  $('.document-close-tablet-0').click(function () {
    $('.tablet-0').addClass('hide');
  });
  
  /*25-08*/
  $('.test-element-header').click(function () {
    $(this).parent().find('.panel-body').toggleClass('hide');
    $(this).find('.test-down-up-arrows').toggleClass('hide');
  })
  
  /*Hiding responses teacher_test_question.html*/
   $('.answer-hide').click(function() {
        $('.test-panel-hide-answers').toggleClass('disabled-answers', this.checked)
    });
  /*Hiding responses teacher_test_question.html*/
  
  /*25-08 END*/
  
  /*28-08*/
  $('.tech-prod-button-down-script').click(function(){
    $(this).parent().find('.tech-prod-general').toggleClass('hide');
     $(this).find('.tech-prod-button').toggleClass('tech-prod-button-down');
    $(this).find('.tech-prod-button').toggleClass('tech-prod-button-up');
  })
  $('.stud-info-button-down-script').click(function(){    
    $(this).find('.stud-info-button').toggleClass('stud-info-button-down');
    $(this).find('.stud-info-button').toggleClass('stud-info-button-up');
    $(this).parent().toggleClass('graf-small');
    
  })
  
  /*28-08*/
  
  /*31-08*/
  
  $('.test-element-header1').click(function () {
    $(this).find('.test-down-up-arrows').toggleClass('hide');
  });
  
  $('.add-element-script').click(function () {
    $('.add-element-panel').removeClass('hide');
  });
  
  $('.add-element-close-btn').click(function () {
    $('.add-element-panel').addClass('hide');
  })
  
  /*31-08 end*/
  
  
  
});