import { $ } from "./utils/dom.js";
import store from "./store/index.js";

//TODO 서버요청 부분
// - [] 웹 서버를 띄운다.
// - [] 서버에 새로운 메뉴명이 추가될 수 있도록 요청한다.
// - [] 서버에서 카테고리별 메뉴리스트를 불러온다.
// - [] 서버에 메뉴가 수정 될 수 있도록 요청한다.
// - [] 서버에 메뉴별 품절상태가 토글될 수 있도록 요청한다.
// - [] 서버에 메뉴가 삭제 될 수 있도록 요청한다.

//TODO 리팩터링 부분
// - [] localStorage에 저장하는 로직은 지운다.
// - [] fetch 비동기 api를 사용하는 부분을 async await을 사용하여 구현한다.

//TODO 사용자 경험
// - [] API 통신이 실패하는 경우에 대해 사용자가 알 수 있게 alert으로 예외처리를 진행한다.
// - [] 중복되는 메뉴는 추가할 수 없다.

let menu = {
    espresso: [],
    frappuccino: [],
    blended: [],
    teavana: [],
    desert: []
};
let currentCategory = 'espresso';

//페이지 처음 진입시 호출하는 함수
const init = () => {
    if (store.getLocalStorage()) {
        menu = store.getLocalStorage();
    }
    render();
    initEventListeners();
}

const checkClassList = (element, className) => element.classList.contains(className);

//Enter키 입력시 새로고침 방지
const menuForm = $('#menu-form');
menuForm.setAttribute('onsubmit', "return false;");

//메뉴 리스트 렌더링 함수
const render = () => {
    const template = menu[currentCategory].map((menuItem, index) => { //computed property 사용
        return `
        <li data-menu-id="${index}" class="menu-list-item d-flex items-center py-2">
            <span class="w-100 pl-2 menu-name ${menuItem.soldOut ? 'sold-out' : ''} ">${menuItem.name}</span>
            <button type="button" class="bg-gray-50 text-gray-500 text-sm mr-1 menu-sold-out-button">품절</button>
            <button type="button" class="bg-gray-50 text-gray-500 text-sm mr-1 menu-edit-button">수정</button>
            <button type="button" class="bg-gray-50 text-gray-500 text-sm menu-remove-button">삭제</button>
        </li>`
    }).join(''); //li태그의 배열을 join을 통해 하나의 문자열로 합친다.

    $('#menu-list').innerHTML = template;
    updateMenuCount();
}

//메뉴개수 업데이트 함수
const updateMenuCount = () => {
    const menuCount = menu[currentCategory].length;
    $('.menu-count').textContent = `총 ${menuCount}개`;
}

//신규메뉴 추가 함수
const addMenuName = () => {
    if ($('#menu-name').value.trim() === "") {
        alert('값을 입력해주세요');
        return;
    }
    menu[currentCategory].push({ name: $('#menu-name').value });
    store.setLocalStorage(menu);
    render();
    $('#menu-name').value = "";
}



const updateMenu = (e) => {
    const menuId = e.target.parentNode.dataset.menuId;
    const menuName = e.target.parentNode.querySelector('.menu-name');
    const updatedMenuName = window.prompt('메뉴명을 수정하세요', menuName.textContent);
    menu[currentCategory][menuId].name = updatedMenuName;
    store.setLocalStorage(menu);
    render();
}

const removeMenu = (e) => {
    const menuId = e.target.parentNode.dataset.menuId;
    const result = window.confirm('정말 삭제하시겠습니까?');
    if (result === true) {
        menu[currentCategory].splice(menuId, 1);
        store.setLocalStorage(menu);
        render();
    }
}

const soldOutMenu = (e) => {
    const menuId = e.target.parentNode.dataset.menuId;
    menu[currentCategory][menuId].soldOut = !menu[currentCategory][menuId].soldOut; //undefined인 경우 false로 판단하므로 true로 변경됨.
    store.setLocalStorage(menu);
    render();
}

//addEventListener을 모아놓은 함수, Init에서 실행
const initEventListeners = () => {
    //input태그에 키입력 이벤트 추가
    $('#menu-name').addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;
        if (event.isComposing !== true) addMenuName();
    })

    //확인버튼에 클릭 이벤트 추가
    const menuSubmitBtn = $('#menu-submit-button');
    menuSubmitBtn.addEventListener('click', () => {
        addMenuName();
    });

    // 메뉴리스트에 클릭 이벤트 추가 (이벤트위임(Delegation) (수정,삭제,품절 버튼))
    $('#menu-list').addEventListener('click', (e) => {
        if (e.target.type != 'button') return; //버튼을 클릭하지 않은경우 빠른리턴
        if (checkClassList(e.target, 'menu-edit-button')) {
            updateMenu(e);
            return;
        }
        if (checkClassList(e.target, 'menu-remove-button')) {
            removeMenu(e);
            return;
        }
        if (checkClassList(e.target, 'menu-sold-out-button')) {
            soldOutMenu(e);
            return;
        }
    });

    //네비게이션에 클릭이벤트 추가 (이벤트위임(Delegation) (카테고리 버튼))
    $('nav').addEventListener('click', (e) => {
        const isCategoryButton = e.target.classList.contains('cafe-category-name');
        if (isCategoryButton) {
            const categoryName = e.target.dataset.categoryName;
            currentCategory = categoryName;
            $('#category-title').textContent = `${e.target.textContent} 메뉴 관리`;
            render();
        }
    })
}

//로컬스토리지에서 메뉴데이터를 받아오고, 메뉴기반 렌더링
init();
