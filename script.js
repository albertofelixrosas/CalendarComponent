// @ts-check

/** @type { HTMLInputElement } */
const htmlInputYear = document.getElementById('year');
/** @type { HTMLSelectElement } */
const htmlSelectMonth = document.getElementById('month');
/** @type { HTMLInputElement } */
const htmlInputDay = document.getElementById('day');
/** @type { HTMLInputElement } */
const htmlInputDays = document.getElementById('number-of-days');
/** @type { HTMLDivElement } */
const htmlMainCalendarsContainer = document.getElementById('main-calendars');
/** @type { HTMLButtonElement } */
const htmlButtonToShow = document.getElementById('button-to-show');

const HOLIDAYS = [
    { day: 1, month: 1 },
    { day: 5, month: 2 },
    { day: 18, month: 3 },
    { day: 1, month: 5 },
    { day: 16, month: 9 },
    { day: 20, month: 11 },
    { day: 25, month: 12 },
];

function initFormValues() {
    const currentDate = new Date();
    htmlInputYear.value = currentDate.getFullYear() + '';
    const options = htmlSelectMonth.getElementsByTagName('option');
    options[currentDate.getMonth()].selected = true;
    htmlInputDay.value = currentDate.getDate() + '';
}

function resetMainCalendarContainer() {
    htmlMainCalendarsContainer.innerHTML = '';
}

initFormValues();
resetMainCalendarContainer();

/**
 * @param {MouseEvent} evt
 */
const handleOnClickShowCalendar = evt => {
    resetMainCalendarContainer();
    const currentDate = getDateOfForm();
    const numberOfDays = getNumberOfDays();
    const selectedDates = getSelectDays(currentDate, numberOfDays);
    const distinctMonthsOfYears = getDistinctMonthsOfYears(selectedDates);
    for (const [year, months] of distinctMonthsOfYears) {
        const yearHeader = createYearHeader(year);
        htmlMainCalendarsContainer.appendChild(yearHeader);

        const allCalendarsOfYear = createAllCalendarsOfYear(year, months, selectedDates);

        allCalendarsOfYear.forEach(calendar => {
            htmlMainCalendarsContainer.appendChild(calendar);
        });
    }
};

function getDateOfForm() {
    const year = parseInt(htmlInputYear.value);
    const month = htmlSelectMonth.selectedIndex;
    const day = parseInt(htmlInputDay.value);
    return new Date(year, month, day);
}

function getNumberOfDays() {
    return parseInt(htmlInputDays.value);
}

/**
 * @param {Date} date
 * @param {number} daysCount
 */
function getSelectDays(date, daysCount) {
    const selectedDates = [];
    for (let i = 0; i < daysCount; i++) {
        const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).setDate(
            date.getDate() + i,
        );
        selectedDates.push(new Date(newDate));
    }
    return selectedDates;
}

/** @param {Date[]} selectedDates */
function getDistinctMonthsOfYears(selectedDates) {
    /** @type { Map<number, Set<number>>  } */
    const yearsWithMonths = new Map();
    for (let i = 0; i < selectedDates.length; i++) {
        const date = selectedDates[i];
        const year = date.getFullYear();
        const month = date.getMonth();

        if (!yearsWithMonths.has(year)) {
            yearsWithMonths.set(year, new Set());
        }
        const monthsOfYear = yearsWithMonths.get(year);
        monthsOfYear?.add(month);
    }

    /** @type { Map<number, number[]> } */
    const result = new Map();
    for (const [year, months] of yearsWithMonths) {
        result.set(year, [...months]);
    }

    return result;
}

/**  @param {number} year */
function createYearHeader(year) {
    const yearHeader = document.createElement('div');
    const yearH2 = document.createElement('h2');
    const yearValue = document.createTextNode(year + '');
    yearH2.appendChild(yearValue);
    yearHeader.appendChild(yearH2);
    yearHeader.classList.add('main-calendars__year');
    return yearHeader;
}

/**
 * @param {number} year
 * @param {number[]} months
 * @param {Date[]} selectedDates
 */
function createAllCalendarsOfYear(year, months, selectedDates) {
    return months.map(month => createSpecificCalendar(year, month, selectedDates));
}

/**
 * @param {number} year
 * @param {number} month
 * @param {Date[]} selectedDates
 * @returns
 */
function createSpecificCalendar(year, month, selectedDates) {
    const calendarDiv = document.createElement('div');
    calendarDiv.classList.add('calendar');
    const calendarHeader = createCalendarHeader(month);
    const calendarBody = createCalendarBody(year, month, selectedDates);
    calendarDiv.appendChild(calendarHeader);
    calendarDiv.appendChild(calendarBody);
    return calendarDiv;
}

/**
 * @param {number} month
 * @returns
 */
function createCalendarHeader(month) {
    const days = ['D', 'L', 'Ma', 'Mi', 'J', 'V', 'S'];
    const calendarDaysOfWeek = document.createElement('div');

    const calendarHeader = document.createElement('div');
    const calendarMonth = document.createElement('div');
    calendarMonth.classList.add('calendar__month');
    const calendarMonthTitle = document.createElement('h3');
    calendarMonthTitle.appendChild(document.createTextNode(getMonthNameByIndex(month) || ''));
    calendarMonth.appendChild(calendarMonthTitle);
    calendarHeader.classList.add('calendar__header');

    calendarDaysOfWeek.classList.add('calendar__days-of-week');
    days.forEach(dayText => {
        const dayOfWeekDiv = document.createElement('div');
        const textNode = document.createTextNode(dayText);
        dayOfWeekDiv.appendChild(textNode);
        dayOfWeekDiv.classList.add('calendar__cell');
        dayOfWeekDiv.classList.add('calendar__cell--cyan');
        calendarDaysOfWeek.appendChild(dayOfWeekDiv);
    });

    calendarHeader.appendChild(calendarMonth);
    calendarHeader.appendChild(calendarDaysOfWeek);

    return calendarHeader;
}

/**
 * @param {number} year
 * @param {number} month
 * @param {Date[]} selectedDates
 */
function createCalendarBody(year, month, selectedDates) {
    const firstDate = selectedDates[0];
    const lastDate = selectedDates[selectedDates.length - 1];
    const calendarBody = document.createElement('div');
    calendarBody.classList.add('calendar__body');

    const datesOfCalendar = getDatesValuesForCalendar(year, month);

    const MONTH_HOLIDAYS = HOLIDAYS.filter(id => id.month - 1 === month);

    for (let i = 0; i < datesOfCalendar.length; i++) {
        const date = datesOfCalendar[i];
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar__cell');
        const dayNodeText = document.createTextNode(date.day + '');
        dayDiv.appendChild(dayNodeText);
        calendarBody.appendChild(dayDiv);

        // Dias fuera del rango del mes actual
        if (!(date.year === year && date.month === month)) {
            dayDiv.classList.add('calendar__cell--gray');
            continue;
        }

        // Dias festivos
        for (const { month: mhMonth, day: mhDay } of MONTH_HOLIDAYS) {
            if (mhMonth - 1 === date.month && mhDay === date.day) {
                dayDiv.classList.add('calendar__cell--orange');
                break;
            }
        }

        if (dayDiv.classList.contains('calendar__cell--orange')) {
            continue;
        }

        // Dias que son fines de semana
        const dayOfWeek = new Date(date.year, date.month, date.day).getDay();

        if (dayOfWeek === 0 || dayOfWeek === 6) {
            dayDiv.classList.add('calendar__cell--yellow');
            continue;
        }

        // Dias seleccionados por el usuario
        if (isBetween(firstDate, lastDate, new Date(date.year, date.month, date.day))) {
            dayDiv.classList.add('calendar__cell--red');
            continue;
        }

        dayDiv.classList.add('calendar__cell--green');
    }

    return calendarBody;
}

/**
 * @param {number} year
 * @param {number} month
 */
function getDatesValuesForCalendar(year, month) {
    const firstDayDate = getDateOfFirstDay(new Date(year, month));
    const indexOfDayOfTheWeek = firstDayDate.getDay();
    const lastDayOfPreviusMonth = getMonthDaysCount(year, month - 1);
    const lastDayOfCurrentMonth = getMonthDaysCount(year, month);

    /** @type { { day: number, month: number, year: number }[] } */
    const result = [];

    for (let i = 0; i < indexOfDayOfTheWeek; i++) {
        result.unshift({
            day: lastDayOfPreviusMonth - i,
            month: month - 1,
            year,
        });
    }
    for (let i = 1; i <= lastDayOfCurrentMonth; i++) {
        result.push({
            day: i,
            month,
            year,
        });
    }
    const lastIterations = 42 - result.length;
    for (let i = 0; i < lastIterations; i++) {
        result.push({
            day: i + 1,
            month: month + 1,
            year,
        });
    }
    return result;
}

/** @param {number} index */
function getMonthNameByIndex(index) {
    switch (index) {
        case 0:
            return 'Enero';
        case 1:
            return 'Febrero';
        case 2:
            return 'Marzo';
        case 3:
            return 'Abril';
        case 4:
            return 'Mayo';
        case 5:
            return 'Junio';
        case 6:
            return 'Julio';
        case 7:
            return 'Agosto';
        case 8:
            return 'Septiembre';
        case 9:
            return 'Octubre';
        case 10:
            return 'Noviembre';
        case 11:
            return 'Diciembre';
        default:
            return null;
    }
}

/**
 * @param {number} year
 * @param {number} month
 */
function getFirstDayOfTheWeekOfAMonth(year, month) {
    const current = new Date(year, month);
    return current.getDay();
}

/**
 * @param {number} year
 * @param {number} month
 */
function getMonthDaysCount(year, month) {
    const current = new Date(year, month);
    const beforeDateNumber = current.setDate(current.getDate() - 1);
    return new Date(beforeDateNumber).getDate();
}

/**
 * @param {Date} start
 * @param {Date} end
 * @param {Date} value
 */
function isBetween(start, end, value) {
    const startMillis = start.getTime();
    const endMillis = end.getTime();
    const valueMillis = value.getTime();
    return startMillis <= valueMillis && endMillis >= valueMillis;
}

/**  @param {Date} date */
function getDateOfFirstDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

htmlButtonToShow.addEventListener('click', handleOnClickShowCalendar);