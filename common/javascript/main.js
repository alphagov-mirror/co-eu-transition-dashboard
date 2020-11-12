import govukFrontend from 'govuk-frontend/govuk/all';

import missedMilestonesChart from './missed-milestones';
import removeAccordionCross from './remove-accordion-cross';
import disableButton from './disable-button';
import groupDisplay from './group-display';
import fieldOrder from './field-order';
import ReadinessAccordion from './readiness-accordion';
import ClearOrRestoreScroll from './readiness-scroll';
import sortTable from './sort-table';

window.TRANSITIONDELIVERYDASHBOARD = {
  missedMilestonesChart,
  removeAccordionCross,
  disableButton,
  groupDisplay,
  fieldOrder,
  sortTable
};

document.addEventListener('DOMContentLoaded', function() {
  govukFrontend.initAll();

  var $readinessAccordions = document.querySelectorAll('[data-module="readiness-accordion"]')



  if ($readinessAccordions) {
    $readinessAccordions.forEach($accordion => new ReadinessAccordion($accordion).init())
  }

  if (document.getElementById('readiness-theme-page')) {
    ClearOrRestoreScroll(document.getElementById('readiness-theme-page'))
  }

  function countDownTime() {
    const second = 1000,
      minute = second * 60,
      hour = minute * 60,
      day = hour * 24;

    const finalTransitionDate = new Date('Jan 01, 2021 23:59:59').getTime();
    const distance = finalTransitionDate - new Date().getTime();

    let daysToDate = Math.floor(distance / day);

    if (distance < 0) {
      daysToDate = 0;
    }

    return daysToDate;
  }

  document.getElementById('countdown').innerHTML = countDownTime(); 
});

// The expanded state of individual instances of the accordion component persists across page loads using sessionStorage.
// These will be removed from the session storage so the accordions will collapse rather than stay open.
// We want to keep session storage on the readiness theme pages to prevent accordions closing on a page refresh 
if (!window.location.pathname.includes('/transition-readiness-detail/')) {
  sessionStorage.clear();
}
