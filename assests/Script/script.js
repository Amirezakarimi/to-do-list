let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');

    html.classList.remove(isDark ? 'dark' : 'light');
    html.classList.add(isDark ? 'light' : 'dark');

    // ذخیره تم در localStorage
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

function addTask() {
    const input = document.getElementById('taskInput');
    const dueDateInput = document.getElementById('dueDateInput');
    const text = input.value.trim();
    const dueDate = dueDateInput.value;

    if (text && dueDate) {
        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            date: new persianDate().format('YYYY/MM/DD'),
            dueDate: dueDate,
        };

        tasks.push(task);
        saveTasks();
        input.value = '';
        dueDateInput.value = '';
        renderTasks();
    }
}

function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveTasks();
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
}

function filterTasks(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filters button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`button[onclick="filterTasks('${filter}')"]`).classList.add('active');
    renderTasks();
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function getRemainingDays(dueDate) {
    const today = new persianDate();
    const due = new persianDate(new Date(dueDate));
    const diffTime = due.valueOf() - today.valueOf();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return 'مهلت تمام شده';
    } else if (diffDays === 0) {
        return 'امروز';
    } else {
        return `${diffDays} روز مانده`;
    }
}

// تبدیل تاریخ میلادی به شمسی برای نمایش در input
function convertToJalaliDate(date) {
    return new persianDate(new Date(date)).format('YYYY-MM-DD');
}

// تبدیل تاریخ شمسی به میلادی برای ذخیره
function convertToGregorianDate(jalaliDate) {
    return new persianDate(jalaliDate).toCalendar('gregorian').toLocale('en').format('YYYY-MM-DD');
}

// اضافه کردن event listener برای تغییر تاریخ
document.getElementById('dueDateInput').addEventListener('change', function (e) {
    const gregorianDate = convertToGregorianDate(e.target.value);
    e.target.setAttribute('data-gregorian', gregorianDate);
});

function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    let filteredTasks = tasks;
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }

    filteredTasks.forEach(task => {
        const remainingTime = getRemainingDays(task.dueDate);
        const isOverdue = remainingTime === 'مهلت تمام شده' && !task.completed;
        const persianDueDate = new persianDate(new Date(task.dueDate)).format('YYYY/MM/DD');

        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''} 
                onclick="toggleTask(${task.id})">
            <span class="task-text ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}">${task.text}</span>
            <div class="task-dates">
                <small>ایجاد شده: ${task.date}</small>
                <small class="${isOverdue ? 'overdue' : ''}">مهلت انجام: ${persianDueDate} (${remainingTime})</small>
            </div>
            <button class="delete-btn" onclick="deleteTask(${task.id})">حذف</button>
        `;
        taskList.appendChild(li);
    });

    const remainingTasks = tasks.filter(task => !task.completed).length;
    document.getElementById('taskCount').textContent = `${remainingTasks} مورد باقی مانده`;
}

// اضافه کردن قابلیت افزودن تسک با کلید Enter
document.getElementById('taskInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

// نمایش تسک‌ها در بارگذاری اولیه
renderTasks();

// تنظیم تم بر اساس مقدار ذخیره شده
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.classList.add(savedTheme); 