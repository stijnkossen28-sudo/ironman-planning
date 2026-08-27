let athlete = null;

let plan = [];

let currentWeekNumber = 1;


/* =========================
   TRAININGSDATABASE
========================= */

const workouts = {

    swim: [
        {
            title: "Techniek zwemmen",
            duration: 45,
            description:
                "Rustige techniektraining. Focus op ligging, catch en efficiënte slag."
        },
        {
            title: "Zwem intervals",
            duration: 60,
            description:
                "15 min inzwemmen, 8 × 100 m stevig met 20 sec herstel, rustig uitzwemmen."
        },
        {
            title: "Lange zwemtraining",
            duration: 75,
            description:
                "Rustige duurtraining met langere blokken. Focus op constante inspanning."
        }
    ],

    bike: [
        {
            title: "Fiets duurtraining",
            duration: 75,
            description:
                "Rustige duurtraining in Z2. Je moet gecontroleerd kunnen blijven praten."
        },
        {
            title: "Fiets tempo",
            duration: 90,
            description:
                "15 min rustig. Daarna 3 × 15 min tempo met 5 min herstel."
        },
        {
            title: "Lange fiets",
            duration: 180,
            description:
                "Lange rustige rit. Focus op voeding, drinken en constante intensiteit."
        }
    ],

    run: [
        {
            title: "Rustige duurloop",
            duration: 50,
            description:
                "Rustige duurloop in Z2. Geen hoge intensiteit."
        },
        {
            title: "Loopinterval",
            duration: 55,
            description:
                "15 min rustig. 6 × 4 min stevig met 2 min rustig herstel."
        },
        {
            title: "Lange duurloop",
            duration: 90,
            description:
                "Rustige lange duurloop. Focus op ontspannen lopen en voeding."
        }
    ],

    strength: [
        {
            title: "Krachttraining",
            duration: 40,
            description:
                "Core, benen, heupen en stabiliteit. Geen maximale gewichten."
        }
    ],

    rest: [
        {
            title: "Rustdag",
            duration: 0,
            description:
                "Volledige rust. Eventueel rustig wandelen of mobiliteit."
        }
    ]

};


/* =========================
   PROFIEL
========================= */

function generatePlan() {

    const raceDate =
        document.getElementById("raceDate").value;

    if (!raceDate) {

        alert(
            "Vul eerst je Ironman datum in."
        );

        return;
    }


    athlete = {

        name:
            document.getElementById(
                "athleteName"
            ).value || "Atleet",

        raceDate:
            raceDate,

        swimLevel:
            document.getElementById(
                "swimLevel"
            ).value,

        bikeLevel:
            document.getElementById(
                "bikeLevel"
            ).value,

        runLevel:
            document.getElementById(
                "runLevel"
            ).value,

        days:
            Number(
                document.getElementById(
                    "trainingDays"
                ).value
            ),

        hours:
            Number(
                document.getElementById(
                    "hoursPerWeek"
                ).value
            ),

        goal:
            document.getElementById(
                "goal"
            ).value

    };


    localStorage.setItem(
        "ironmanAthlete",
        JSON.stringify(athlete)
    );


    createPlan();

    currentWeekNumber = 1;

    document
        .getElementById("dashboard")
        .classList.remove("hidden");


    renderDashboard();

    window.scrollTo({
        top: document
            .getElementById("dashboard")
            .offsetTop,
        behavior: "smooth"
    });

}


/* =========================
   PLAN GENERATOR
========================= */

function createPlan() {

    const today =
        new Date();

    const race =
        new Date(
            athlete.raceDate + "T00:00:00"
        );


    const milliseconds =
        race - today;

    let weeks =
        Math.floor(
            milliseconds /
            (1000 * 60 * 60 * 24 * 7)
        );


    weeks =
        Math.max(
            4,
            Math.min(
                32,
                weeks
            )
        );


    plan = [];


    for (
        let week = 1;
        week <= weeks;
        week++
    ) {

        let phase;

        const percentage =
            week / weeks;


        if (percentage <= 0.25) {

            phase = "Basis";

        } else if (percentage <= 0.65) {

            phase = "Opbouw";

        } else if (percentage <= 0.9) {

            phase = "Ironman specifiek";

        } else {

            phase = "Taper";

        }


        const weekData = {

            week: week,

            phase: phase,

            workouts:
                createWeekWorkouts(
                    week,
                    weeks
                )

        };


        plan.push(weekData);

    }


    localStorage.setItem(
        "ironmanPlan",
        JSON.stringify(plan)
    );

}


/* =========================
   WEEK TRAININGEN
========================= */

function createWeekWorkouts(
    week,
    totalWeeks
) {

    const result = [];


    /*
       Herstelweek iedere vierde week.
    */

    const recovery =
        week % 4 === 0 &&
        week < totalWeeks - 2;


    let volumeMultiplier =
        recovery
        ? 0.75
        : 1;


    /*
       Progressieve belasting.
    */

    const progress =
        Math.min(
            1.25,
            0.75 +
            (week / totalWeeks) * 0.5
        );


    /*
       Maandag = rust
    */

    result.push(
        workout(
            0,
            "rest",
            "Rustdag",
            0,
            "Volledige rust en herstel."
        )
    );


    /*
       Dinsdag = zwemmen
    */

    result.push(
        workoutFromDatabase(
            1,
            "swim",
            progress,
            volumeMultiplier
        )
    );


    /*
       Woensdag = lopen
    */

    result.push(
        workoutFromDatabase(
            2,
            "run",
            progress,
            volumeMultiplier
        )
    );


    /*
       Donderdag = fietsen
    */

    result.push(
        workoutFromDatabase(
            3,
            "bike",
            progress,
            volumeMultiplier
        )
    );


    /*
       Vrijdag = kracht / rust
    */

    if (athlete.days >= 6) {

        result.push(
            workoutFromDatabase(
                4,
                "strength",
                1,
                volumeMultiplier
            )
        );

    } else {

        result.push(
            workout(
                4,
                "rest",
                "Rustdag",
                0,
                "Herstel."
            )
        );

    }


    /*
       Zaterdag = lange fiets
    */

    result.push(
        workout(
            5,
            "bike",
            "Lange fiets",
            Math.round(
                150 *
                progress *
                volumeMultiplier
            ),
            "Lange duurtraining in Z2. Oefen voeding en drinken tijdens de training."
        )
    );


    /*
       Zondag = lange loop
    */

    result.push(
        workout(
            6,
            "run",
            "Lange duurloop",
            Math.round(
                75 *
                progress *
                volumeMultiplier
            ),
            "Rustige duurloop. Houd de intensiteit laag en oefen wedstrijdvoeding."
        )
    );


    return result;

}


/* =========================
   WORKOUT MAKEN
========================= */

function workout(
    day,
    type,
    title,
    duration,
    description
) {

    return {

        id:
            Date.now() +
            "-" +
            Math.random(),

        day:
            day,

        type:
            type,

        title:
            title,

        duration:
            duration,

        description:
            description,

        completed:
            false

    };

}


function workoutFromDatabase(
    day,
    type,
    progress,
    multiplier
) {

    const list =
        workouts[type];

    const index =
        Math.min(
            list.length - 1,
            Math.floor(
                progress *
                list.length
            ) - 1
        );


    const selected =
        list[
            Math.max(0, index)
        ];


    return workout(

        day,

        type,

        selected.title,

        Math.round(
            selected.duration *
            multiplier
        ),

        selected.description

    );

}


/* =========================
   DASHBOARD
========================= */

function renderDashboard() {

    const race =
        new Date(
            athlete.raceDate +
            "T00:00:00"
        );


    const today =
        new Date();


    const days =
        Math.ceil(
            (
                race -
                today
            ) /
            (
                1000 *
                60 *
                60 *
                24
            )
        );


    document.getElementById(
        "welcome"
    ).textContent =
        "Hoi " +
        athlete.name +
        " 👋";


    document.getElementById(
        "raceInfo"
    ).textContent =
        "Ironman op " +
        race.toLocaleDateString(
            "nl-NL"
        );


    document.getElementById(
        "daysRemaining"
    ).textContent =
        Math.max(0, days);


    document.getElementById(
        "statDays"
    ).textContent =
        athlete.days;


    document.getElementById(
        "statHours"
    ).textContent =
        athlete.hours;


    document.getElementById(
        "statWeeks"
    ).textContent =
        plan.length;


    renderWeek();

}


/* =========================
   WEEK WEERGAVE
========================= */

function renderWeek() {

    const week =
        plan[
            currentWeekNumber - 1
        ];


    if (!week) return;


    document.getElementById(
        "weekTitle"
    ).textContent =
        "Week " +
        week.week;


    document.getElementById(
        "weekSubtitle"
    ).textContent =
        week.phase;


    document.getElementById(
        "statPhase"
    ).textContent =
        week.phase;


    const container =
        document.getElementById(
            "weekPlan"
        );


    container.innerHTML = "";


    const names = [
        "Maandag",
        "Dinsdag",
        "Woensdag",
        "Donderdag",
        "Vrijdag",
        "Zaterdag",
        "Zondag"
    ];


    week.workouts.forEach(
        (training) => {

            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "day";


            element.innerHTML = `

                <div class="day-header">

                    <div class="day-name">
                        ${names[training.day]}
                    </div>

                    <div class="day-date">
                        ${training.duration} min
                    </div>

                </div>


                <div class="
                    workout
                    ${training.type}
                    ${training.completed
                        ? "completed"
                        : ""}
                ">

                    <div class="workout-title">
                        ${trainingIcon(training.type)}
                        ${training.title}
                    </div>

                    <div class="workout-meta">
                        ${training.duration > 0
                            ? training.duration + " minuten"
                            : "Herstel"}
                    </div>

                    <div class="workout-description">
                        ${training.description}
                    </div>

                    <button
                        class="secondary workout-action"
                        onclick="toggleWorkout('${training.id}')"
                    >
                        ${
                            training.completed
                            ? "↩ Niet voltooid"
                            : "✓ Training voltooid"
                        }
                    </button>

                </div>

            `;


            container.appendChild(
                element
            );

        }
    );


    updateProgress();

}


/* =========================
   ICONEN
========================= */

function trainingIcon(type) {

    const icons = {

        swim: "🏊",

        bike: "🚴",

        run: "🏃",

        strength: "🏋️",

        rest: "😴"

    };


    return icons[type] || "🏃";

}


/* =========================
   TRAINING VOLTOOIEN
========================= */

function toggleWorkout(id) {

    const week =
        plan[
            currentWeekNumber - 1
        ];


    const training =
        week.workouts.find(
            w => w.id === id
        );


    if (!training) return;


    training.completed =
        !training.completed;


    localStorage.setItem(
        "ironmanPlan",
        JSON.stringify(plan)
    );


    renderWeek();

}


/* =========================
   VOORTGANG
========================= */

function updateProgress() {

    const week =
        plan[
            currentWeekNumber - 1
        ];


    if (!week) return;


    const total =
        week.workouts.length;


    const completed =
        week.workouts.filter(
            w => w.completed
        ).length;


    const percentage =
        total === 0
        ? 0
        : Math.round(
            (
                completed /
                total
            ) *
            100
        );


    document.getElementById(
        "progressText"
    ).textContent =
        percentage +
        "% voltooid";


    document.getElementById(
        "progressBar"
    ).style.width =
        percentage +
        "%";

}


/* =========================
   WEEK NAVIGATIE
========================= */

function previousWeek() {

    if (
        currentWeekNumber > 1
    ) {

        currentWeekNumber--;

        renderWeek();

    }

}


function nextWeek() {

    if (
        currentWeekNumber <
        plan.length
    ) {

        currentWeekNumber++;

        renderWeek();

    }

}


function currentWeek() {

    currentWeekNumber = 1;

    renderWeek();

}


/* =========================
   RESET
========================= */

function resetPlan() {

    const answer =
        confirm(
            "Weet je zeker dat je je trainingsplan opnieuw wilt instellen?"
        );


    if (!answer) return;


    localStorage.removeItem(
        "ironmanAthlete"
    );

    localStorage.removeItem(
        "ironmanPlan"
    );


    location.reload();

}


/* =========================
   AUTOMATISCH LADEN
========================= */

window.addEventListener(
    "DOMContentLoaded",
    () => {

        const savedAthlete =
            localStorage.getItem(
                "ironmanAthlete"
            );


        const savedPlan =
            localStorage.getItem(
                "ironmanPlan"
            );


        if (
            savedAthlete &&
            savedPlan
        ) {

            athlete =
                JSON.parse(
                    savedAthlete
                );


            plan =
                JSON.parse(
                    savedPlan
                );


            document.getElementById(
                "athleteName"
            ).value =
                athlete.name;


            document.getElementById(
                "raceDate"
            ).value =
                athlete.raceDate;


            document.getElementById(
                "swimLevel"
            ).value =
                athlete.swimLevel;


            document.getElementById(
                "bikeLevel"
            ).value =
                athlete.bikeLevel;


            document.getElementById(
                "runLevel"
            ).value =
                athlete.runLevel;


            document.getElementById(
                "trainingDays"
            ).value =
                athlete.days;


            document.getElementById(
                "hoursPerWeek"
            ).value =
                athlete.hours;


            document.getElementById(
                "goal"
            ).value =
                athlete.goal;


            document
                .getElementById(
                    "dashboard"
                )
                .classList.remove(
                    "hidden"
                );


            renderDashboard();

        }

    }
);
