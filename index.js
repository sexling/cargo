const css = {
	class: {
		bulletMenu: '.bullet-menu',
		bullet: '.bullet',
		expand: '.expand',
		listBtnRemove: '.list-btn-remove',
		listBtnCross: '.list-btn-cross',
		listBtnEdit: '.list-btn-edit',
		listContent: '.list-content',
		crossed: '.crossed',
		editColor: '.edit-color',
		hide: '.hide'
	},
	id: {
		mainInput: '#main-input',
		mainBtn: '#main-button',
		listContainer: '#list-container',
		maxLengthIndicator: '#max-length-indicator'
	}
};

const htmlElements = {
	listBullet: `<li><span class="bullet">●</span><span class="list-content">**text**</span></li>`,
	listMenu: `<button class="list-btn-remove">Remove</button> <button class="list-btn-cross">Cross</button> <button class="list-btn-edit">Edit</button>`
};

const rmSelector = (str) => {
	return str.replace(/[.#]/, '');
};

const mainInputString = rmSelector(css.id.mainInput);
const mainBtnString = rmSelector(css.id.mainBtn);
const listContainerString = rmSelector(css.id.listContainer);
const maxLengthIndicatorString = rmSelector(css.id.maxLengthIndicator);

const mainInput = document.getElementById(mainInputString);
const mainBtn = document.getElementById(mainBtnString);
const maxLengthIndicator = document.getElementById(maxLengthIndicatorString);
const listContainer = document.getElementById(listContainerString);

const state = {
	originalText: null,
	isEditModeOn: false,
	inputLength: 1,
	isfirstTimeEditMode: true
};

const hideCharCount = () => {
	const hideString = rmSelector(css.class.hide);

	maxLengthIndicator.classList.add('hide');
	console.log(maxLengthIndicator);
};

const showCharCount = () => {
	const hideString = rmSelector(css.class.hide);
	maxLengthIndicator.classList.remove(hideString);
};

const countTextInsideInput = (e = {}) => {
	const maxChar = 22;

	if (state.isEditModeOn) {
		const inputLength = mainInput.value.length || 1;
		const charRemaining = maxChar - inputLength;
		state.inputLength = inputLength;
		console.log(state.inputLength);

		maxLengthIndicator.textContent = charRemaining;

		if (e.keyCode !== 13) {
			!inputLength ? hideCharCount() : showCharCount();
		}
	} else {
		const inputLength = mainInput.value.length + 1;
		const charRemaining = maxChar - inputLength;
		state.inputLength = inputLength;
		console.log(state.inputLength);

		maxLengthIndicator.textContent = charRemaining;

		if (e.keyCode !== 13) {
			!inputLength ? hideCharCount() : showCharCount();
		}
	}
};

const decrementStateInputLength = () => {
	if (state.inputLength === 1) {
		return null;
	}
	state.inputLength -= 1;
};

const countTextInsideInput_KEYDOWN = (e) => {
	if (mainInput.value && e.keyCode === 13) {
		hideCharCount();
		return true;
	}
	if (e.keyCode !== 8) {
		return false;
	}

	const maxChar = 22;
	// decrementStateInputLength();
	state.inputLength -= 1;
	const inputLength = state.inputLength;
	// to be honest I'm confused with the solution to add 2 to fix character count when pressing backspace

	const charRemaining = maxChar - inputLength;
	console.log(inputLength);

	maxLengthIndicator.textContent = charRemaining;

	inputLength < 1 ? hideCharCount() : showCharCount();
};

const shortenTextAddEllispsis = (element) => {
	const str = element.textContent;
	state.originalText = str;
	if (str.length > 4) {
		element.textContent = str.slice(0, 6) + '...';
	}
};

const revertOriginalText = (element) => {
	element.textContent = state.originalText;
};

const addElement = () => {
	let html = htmlElements.listBullet;
	html = html.replace('**text**', mainInput.value);
	listContainer.insertAdjacentHTML('beforeend', html);
	mainInput.value = '';
	mainInput.focus();
};

const editElement = () => {
	const liElement = listContainer.querySelector(css.class.expand);
	const listContent = liElement.querySelector(css.class.listContent);
	// this line below is useless since the state overides
	// keeping it because next time I create an app I won't do this again
	listContent.textContent = mainInput.value;
	// a hack solution to the global bulletMenu closing
	// since expanding bulletMenu will shorten text through JS
	// once bulletMenu closes then shorten text will return
	// to it's original length through state
	state.originalText = mainInput.value;

	mainInput.value = '';
	mainInput.focus();
};

const addListByInput = (e) => {
	countTextInsideInput(e);
	if (e.target.value.trim() && e.keyCode === 13) {
		state.isEditModeOn ? editElement() : addElement();

		removeBulletMenuGlobal(e);
		// I am using the same input for editing lists
		// I'm sure there are better implementations
		setButtonToAddGlobal(e);
	}
};

const addListByButton = () => {
	if (mainInput.value.trim()) {
		state.isEditModeOn ? editElement() : addElement();
	}
};

const closeOtherBulletMenu = () => {
	const otherMenuOpened = listContainer.querySelector(css.class.bulletMenu);

	if (otherMenuOpened) {
		const bulletMenuString = rmSelector(css.class.bulletMenu);
		const bulletString = rmSelector(css.class.bullet);
		const expandString = rmSelector(css.class.expand);
		const parent = otherMenuOpened.parentNode;
		const listContent = parent.querySelector(css.class.listContent);

		revertOriginalText(listContent);

		otherMenuOpened.classList.toggle(bulletString);
		otherMenuOpened.classList.toggle(bulletMenuString);
		otherMenuOpened.innerHTML = '●';
		parent.classList.toggle(expandString);
	}
};

const toggleBulletMenu = (e) => {
	if (e.target.className === 'bullet') {
		const bulletMenuString = rmSelector(css.class.bulletMenu);
		const bulletString = rmSelector(css.class.bullet);
		const expandString = rmSelector(css.class.expand);
		const spanBullet = e.target;
		const parent = spanBullet.parentNode;
		const listContent = parent.querySelector(css.class.listContent);

		closeOtherBulletMenu();

		spanBullet.classList.toggle(bulletString);
		spanBullet.classList.toggle(bulletMenuString);
		spanBullet.innerHTML = htmlElements.listMenu;
		parent.classList.toggle(expandString);

		const expandExists = parent.classList.contains(expandString);
		expandExists ? shortenTextAddEllispsis(listContent) : revertOriginalText(listContent);
	}
};

const removeBulletMenuGlobal = (e) => {
	const mainInputExists = e.target.matches(css.id.mainInput);

	if (
		e.keyCode === 13 ||
		((e.keyCode === 13 || !e.target.closest(css.class.bulletMenu)) &&
			// if Editing a list and user clicks input, menu will not close
			(!state.isEditModeOn || !mainInputExists))
	) {
		const bulletMenuString = rmSelector(css.class.bulletMenu);
		const bulletString = rmSelector(css.class.bullet);
		const expandString = rmSelector(css.class.expand);
		const spanBullet = listContainer.querySelector(css.class.bulletMenu);

		if (spanBullet) {
			const parent = spanBullet.parentNode;
			const listContent = parent.querySelector(css.class.listContent);

			revertOriginalText(listContent);
			spanBullet.classList.toggle(bulletString);
			spanBullet.classList.toggle(bulletMenuString);
			spanBullet.innerHTML = '●';
			parent.classList.toggle(expandString);
			toggleListEditColor(e);
		}
	}
};

const deleteList = (e) => {
	const element = e.target.closest(css.class.listBtnRemove);
	if (element) {
		const list = element.parentNode.parentNode;
		list.parentNode.removeChild(list);
	}
	mainInput.focus();
};

const crossList = (e) => {
	const element = e.target.closest(css.class.listBtnCross);
	if (element) {
		const crossedString = rmSelector(css.class.crossed);
		const listContent = element.parentNode.parentNode.querySelector(css.class.listContent);

		listContent.classList.toggle(crossedString);
	}
};

const editList = (e) => {
	state.isEditModeOn ? setButtonToAdd(e) : setButtonToEdit(e);
};

const toggleListEditColor = (e) => {
	const parent = e.target.closest(css.class.bulletMenu);
	const listBtnEditExists = e.target.matches(css.class.listBtnEdit);
	const editColorString = rmSelector(css.class.editColor);

	if (parent) {
		const listBtnEdit = parent.querySelector(css.class.listBtnEdit);

		if (listBtnEditExists) {
			if (state.isEditModeOn) {
				listBtnEdit.classList.remove(editColorString);
			} else {
				listBtnEdit.classList.add(editColorString);
			}
		}
	}
};

const setButtonToAdd = (e) => {
	const listBtnEditExists = e.target.matches(css.class.listBtnEdit);
	const mainInputExists = e.target.matches(css.id.mainInput);

	if (state.isEditModeOn && listBtnEditExists) {
		const editColorString = rmSelector(css.class.editColor);

		mainBtn.textContent = 'Add';
		mainBtn.classList.remove(editColorString);

		toggleListEditColor(e);
		state.isEditModeOn = false;
	}
};

const setButtonToAddGlobal = (e) => {
	const mainInputExists = e.target.matches(css.id.mainInput);
	const listBtnEditExists = e.target.matches(css.class.listBtnEdit);

	if ((!mainInputExists || e.keyCode === 13) && !listBtnEditExists) {
		const editColorString = rmSelector(css.class.editColor);

		mainBtn.textContent = 'Add';
		mainBtn.classList.remove(editColorString);

		toggleListEditColor(e);
		state.isEditModeOn = false;
	}
};

const setButtonToEdit = (e) => {
	const listBtnEditExists = e.target.matches(css.class.listBtnEdit);
	if (!state.isEditModeOn && listBtnEditExists) {
		const editColorString = rmSelector(css.class.editColor);
		const listBtnEdit = e.target;
		const parent = listBtnEdit.parentNode.parentNode;
		const listContent = parent.querySelector(css.class.listContent);
		mainInput.value = state.originalText;

		mainBtn.textContent = 'Edit';
		mainBtn.classList.add(editColorString);

		mainInput.focus();
		toggleListEditColor(e);
		state.isEditModeOn = true;
		countTextInsideInput();
	}
};

mainInput.addEventListener('keypress', addListByInput);
mainInput.addEventListener('keydown', countTextInsideInput_KEYDOWN);
mainBtn.addEventListener('click', addListByButton);
listContainer.addEventListener('click', toggleBulletMenu);
listContainer.addEventListener('click', deleteList);
listContainer.addEventListener('click', crossList);
listContainer.addEventListener('click', editList);
window.addEventListener('click', removeBulletMenuGlobal);
window.addEventListener('click', setButtonToAddGlobal);
