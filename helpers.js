/*
 *          JS comun o generico
 */

// Funcion para renderizar vistas parciales
export const renderPartialView = async (url, container, errorMsg, replace = false) => {
    if (!errorMsg) {
        errorMsg = 'Ha ocorregut un error. Intenti-ho de tornada refrescant la pàgina.';
    }

    if (!container) {
        throw new Error(errorMsg);
    }

    try {
        const response = await fetch(url);

        if (response.ok) {
            const data = await response.text();


            if (replace) {
                container = data;
            } else {
                container.innerHTML = data;
            }
        } else {
            throw new Error(errorMsg);
        }
    } catch (error) {
        console.error('Error:', error);
        EIA.Toast.show('Error', errorMsg, 'error');
    }
};

// Funcion para construir las urls
export const constructUrl = (relativeUrl, paramPairs = []) => {
    const baseUrl = window.location.origin;
    const url = new URL(relativeUrl, baseUrl);

    paramPairs.forEach(pair => {
        url.searchParams.set(pair.key, pair.value);
    });

    return url;
};

// Funcion para actualizar los parametros de una URL sin redirigir
export const updateQueryParam = (url, key, value) => {
    var urlObject = new URL(url);
    var searchParams = urlObject.searchParams;

    if (searchParams.has(key)) {
        searchParams.set(key, value);
    } else {
        searchParams.append(key, value);
    }

    history.pushState(null, null, urlObject.href);
}

// Funcion para setear una cookie
export const setCookie = (name, value) => {
    const expires = "; expires=" + "Session";
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
};

// Funcion para obtener una cookie
export const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
};

// Funcion para borrar una cookie
export const eraseCookie = (name) => {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

// Funcion para dar funcionalidad a menu lateral
export const setupSideMenu = (sideMenuId, sideMenuToggleId, toggleOpenId, toggleCloseId, menulatStateCookie) => {
    const sideMenu = document.getElementById(sideMenuId);
    const sideMenuToggle = document.getElementById(sideMenuToggleId);
    const toggleOpenIcon = document.getElementById(toggleOpenId);
    const toggleCloseIcon = document.getElementById(toggleCloseId);

    if (sideMenu && sideMenuToggle && toggleOpenIcon && toggleCloseIcon) {
        sideMenuToggle.onclick = () => {
            sideMenu.classList.toggle('collapsed')
            toggleOpenIcon.classList.toggle('d-none')
            toggleCloseIcon.classList.toggle('d-none')
            setCookie(menulatStateCookie, sideMenu.classList.contains('collapsed') ? "false" : "true");
        }
    }
};

// Funcion para ejecutar scripts de una parcial
export const setInnerHTML = (elm, html) => {
    elm.innerHTML = html;
    Array.from(elm.querySelectorAll("script"))
        .forEach(oldScriptEl => {
            const newScriptEl = document.createElement("script");

            Array.from(oldScriptEl.attributes).forEach(attr => {
                newScriptEl.setAttribute(attr.name, attr.value);
            });

            const scriptText = document.createTextNode(oldScriptEl.innerHTML);
            newScriptEl.appendChild(scriptText);

            oldScriptEl.parentNode.replaceChild(newScriptEl, oldScriptEl);
        });
};

// Funcion para cerrar modales
export const closeModal = (modal, form, className) => {
    modal.classList.add(className);
    form && clearForm(form);
};

// Funcion auxiliar para la limpieza de un input
export const clearInputValue = (input) => {
    const isCheckboxOrRadio = input.type === 'checkbox' || input.type === 'radio';
    const defaultValue = input.getAttribute('data-default');

    if (isCheckboxOrRadio) {
        input.checked = defaultValue !== null ? defaultValue : false;
    } else {
        input.value = defaultValue !== null ? defaultValue : '';
    }
};

// Funcion auxiliar para la limpieza de un select
export const clearSelectValue = (select) => {
    const defaultValue = select.getAttribute('data-default');
    select.selectedIndex = defaultValue !== null ? defaultValue : 0;
};

// Funcion auxiliar para la limpieza de un textarea
export const clearTextareaValue = (textarea) => {
    const defaultValue = textarea.getAttribute('data-default');
    textarea.value = defaultValue !== null ? defaultValue : '';
};

// Funcion para resetear formularios
export const clearForm = (form) => {
    // Se resetean todos los elementos que no sean inmutables (data-immutable)
    const inputs = form.querySelectorAll('input:not([type="submit"]):not([type="button"]):not([data-immutable])');
    inputs.forEach(clearInputValue);

    const textareas = form.querySelectorAll('textarea:not([data-immutable])');
    textareas.forEach(clearTextareaValue);

    const selects = form.querySelectorAll('select:not([data-immutable])');
    selects.forEach(clearSelectValue);

    const containers = form.querySelectorAll('[data-form-container]:not([data-immutable])');
    containers.forEach(container => container.innerHTML = '');
}

// Funcion para validar formularios
export const isFormValid = (form) => {
    // Obtiene todos los inputs (exceptuando los de tipo radio a menos que sean requeridos),
    // los selects requeridos y todos los textareas.
    const requiredElements = form
        .querySelectorAll('input:not([disabled]):not([type="radio"]:not([required])), select:not([disabled]):required, textarea:not([disabled])');

    // Si no existe un patron especifico para un input de texto se usa el siguiente
    const defaultTextPattern = /^[^\s]+$/;

    // Flag para validar elementos
    let isFormValid = true;

    requiredElements.forEach(element => {
        // Se valida segun el tipo de elemento
        const elementType = element.type;
        const isRequired = element.hasAttribute('required');
        const value = element.value;

        if (elementType === 'text' || elementType === 'textarea') {
            // Se valida contra el patron del elemento; si no tiene, se le asigna uno por defecto
            const patternString = element.getAttribute('pattern') || defaultTextPattern;
            const pattern = new RegExp(patternString);

            // Si el elemento es requerido, se lo valida contra su patron
            // Si no es requerido, se permite que este vacio
            const patternTest = pattern.test(value);
            const isValid = (patternTest) || (!isRequired && value.length === 0);

            if (!isValid) {
                /*console.log(element);*/
                isFormValid = false;
            }
        } else if (elementType === 'number') {
            // Validacion numerica
            const min = parseFloat(element.min);
            const max = parseFloat(element.max);
            const floatValue = parseFloat(value);

            const patternTest = !isNaN(floatValue) && (min === undefined || floatValue >= min) && (max === undefined || floatValue <= max);
            const isValid = (patternTest) || (!isRequired && value.length === 0);

            if (!isValid) {
                /*console.log(element);*/
                isFormValid = false;
            }
        } else if (elementType === 'date') {
            // Validacion de fechas
            const minAttribute = element.getAttribute('min');
            const maxAttribute = element.getAttribute('max');
            const inputDate = new Date(value);

            let isValid = !isNaN(inputDate);

            if (minAttribute !== null) {
                const minDate = new Date(minAttribute);
                isValid = isValid && (!isNaN(minDate) ? inputDate >= minDate : true);
            }

            if (maxAttribute !== null) {
                const maxDate = new Date(maxAttribute);
                isValid = isValid && (!isNaN(maxDate) ? inputDate <= maxDate : true);
            }

            if (!isValid) {
                /*console.log(element);*/
                isFormValid = false;
            }
        } else if (elementType === 'select-one') {
            // Validacion de selectores
            const selectedValue = value;
            const isValid = selectedValue !== '';

            if (!isValid) {
                /*console.log(element);*/
                isFormValid = false;
            }
        }
    });

    /*console.log(isFormValid);*/
    return isFormValid;
}

// Funcion para dar funcionalidad a la paginacion de una lista/tabla
export const setupPagination = (
    itemsList, itemsPerPage, pageIndicator, firstPageBtn, prevPageBtn, nextPageBtn, lastPageBtn
) => {
    let currentPage = 1;

    // Calcula el numero total de paginas
    const maxPages = Math.ceil(itemsList.length / itemsPerPage);

    // Funcion para renderizar los distintos elementos
    const renderItems = (page) => {
        // El inidice inicial inicia en 0
        const startIndex = (page - 1) * itemsPerPage;
        // El indice final sera a lo sumo el largo
        const endIndex = Math.min(startIndex + itemsPerPage, itemsList.length);

        // Muestra u oculta los elementos
        for (let i = 0; i < itemsList.length; i++) {
            if (i >= startIndex && i < endIndex) {
                itemsList[i].classList.remove('d-none');
            } else {
                itemsList[i].classList.add('d-none');
            }
        }

        // Actualiza el indicador de pagina actual
        pageIndicator.textContent = page;
    };

    // Habilitado o deshabilitado de botones
    const updateButtons = () => {
        if (currentPage === 1) {
            firstPageBtn.setAttribute('disabled', '');
            prevPageBtn.setAttribute('disabled', '');
        } else {
            firstPageBtn.removeAttribute('disabled');
            prevPageBtn.removeAttribute('disabled');
        }

        if (currentPage === maxPages) {
            nextPageBtn.setAttribute('disabled', '');
            lastPageBtn.setAttribute('disabled', '');
        } else {
            nextPageBtn.removeAttribute('disabled');
            lastPageBtn.removeAttribute('disabled');
        }
    };

    // Funciones para navegar en el paginado
    const firstPage = () => {
        if (currentPage > 1) {
            currentPage = 1;
            renderItems(currentPage);
            updateButtons();
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            currentPage--;
            renderItems(currentPage);
            updateButtons();
        }
    };

    const nextPage = () => {
        if (currentPage < maxPages) {
            currentPage++;
            renderItems(currentPage);
            updateButtons();
        }
    };

    const lastPage = () => {
        if (currentPage < maxPages) {
            currentPage = maxPages;
            renderItems(currentPage);
            updateButtons();
        }
    };

    // Asigno los comportamientos de los botones
    firstPageBtn.onclick = firstPage;
    prevPageBtn.onclick = prevPage;
    nextPageBtn.onclick = nextPage;
    lastPageBtn.onclick = lastPage;

    // Renderizado inicial
    renderItems(currentPage);
    updateButtons();
};

// Funcion para actualizar el texto de un dropdown multiple
export const updateDropdownTextAndValue = (checkboxes, dropdownText, dropdownValue, defaultOption) => {
    const selectedCheckboxes = Array.from(checkboxes).filter(cb => cb.checked);

    if (selectedCheckboxes.length > 0) {
        // Se actualiza el texto del dropdown
        dropdownText && (dropdownText.value = selectedCheckboxes.map(cb => cb.getAttribute('data-display-text')).join(', '));
        // Se actualiza el valor del dropdown
        dropdownValue && (dropdownValue.value = selectedCheckboxes.map(cb => cb.value).join(', '));
    } else {
        // Se resetea el dropdown
        defaultOption && (defaultOption.checked = true);
        dropdownValue && (dropdownValue.value = '');

        // Se actualiza el texto del dropdown
        if (dropdownText) {
            // Si hay opcion por defecto se recupera desde aqui
            if (defaultOption) {
                dropdownText.value = defaultOption.getAttribute('data-display-text');
            } else {
                // Si no existe la obtenemos del texto por defecto
                const defaultValue = dropdownText.getAttribute('data-default')
                dropdownText.value = defaultValue;

                // Se vuelven a marcar los valores por defecto
                checkboxes.forEach(cb => {
                    if (cb.value === defaultValue) {
                        cb.checked = true;
                    }
                });
            }
        }
    }
};

// Funcion para dar funcionalidad a un selector dropdown multiple
export const setupDropdown = (dropdownId, genericOption = '') => {
    const dropdown = document.querySelector(`[data-dropdown-id="${dropdownId}"]`);
    const dropdowns = document.querySelectorAll('[data-dropdown-menu]');

    if (dropdown) {
        const dropdownToggle = dropdown.querySelector(`[data-dropdown-toggle="${dropdownId}"]`);
        const dropdownValue = dropdown.querySelector(`[data-dropdown-value="${dropdownId}"]`);
        const dropdownText = dropdown.querySelector(`[data-dropdown-text="${dropdownId}"]`);
        const dropdownMenu = dropdown.querySelector(`[data-dropdown-menu="${dropdownId}"]`);
        const dropdownItems = dropdownMenu.querySelectorAll('[data-dropdown-item]');
        const checkboxes = dropdownMenu.querySelectorAll('[data-dropdown-checkbox]');

        dropdownToggle.onclick = event => {
            event.stopPropagation();
            dropdowns.forEach(dropdown => dropdown !== dropdownMenu
                ? dropdown.classList.remove('show')
                : dropdownMenu.classList.toggle('show'));
        };

        // Al elegir opciones
        dropdownMenu.onclick = event => event.stopPropagation();

        // Habilito marcar checkboxes sin necesidad de clickear sobre la caja
        dropdownItems.forEach(item => {
            item.onclick = event => {
                event.stopPropagation();
                const checkbox = event.currentTarget.querySelector('input[type="checkbox"]');
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change'));
            };
        });

        // Identificamos si existe opcion predeterminada
        const defaultOption = checkboxes[0].value === genericOption ? checkboxes[0] : null;
        checkboxes.forEach(checkbox => {
            checkbox.onclick = event => event.stopPropagation();
            checkbox.onchange = () => {
                checkboxes.forEach(cb => {
                    // Si la casilla actual no es la casilla marcada
                    if (cb !== checkbox) {
                        // Desmarcamos las otras casillas si se marca la opcion generica
                        cb.checked = checkbox.value === genericOption ? false : cb.checked;
                    }
                });

                // Si la opcion predetermina existe y esta marcada se desmarca
                if (defaultOption && defaultOption.checked) {
                    defaultOption.checked = false;
                }

                // Se actualiza el texto del dropdown
                updateDropdownTextAndValue(checkboxes, dropdownText, dropdownValue, defaultOption);
            };
        });

        // Se cierra el dropdown si se clickea fuera de el
        window.addEventListener('click', event => {
            if (!dropdown.contains(event.target)) {
                dropdownMenu.classList.remove('show');
            }
        });

        // Se actualiza el texto con los checkboxes marcados por defecto
        updateDropdownTextAndValue(checkboxes, dropdownText, dropdownValue, defaultOption);
    }
};

// Funcion para extraer una lista de las opciones seleccionadas en un dropdown multiple
export const getSelectedCheckboxes = (selectId) => {
    const checkboxes = document.querySelectorAll(`[data-dropdown-id="${selectId.toLowerCase()}"] input[type="checkbox"]:checked`);

    return Array.from(checkboxes).map(function (checkbox) {
        return checkbox.value;
    });
};

// Funcion para settear los cb marcados de un dropdown a partir de una string de los valores
export const setSelectedCheckboxes = (dropdownId, valuesString) => {
    const dropdown = document.querySelector(`[data-dropdown-id="${dropdownId}"]`);

    if (dropdown) {
        const checkboxes = dropdown.querySelectorAll('[data-dropdown-checkbox]');

        const valuesArray = valuesString.split(',').map(value => value.trim());

        Array.from(checkboxes).forEach(cb => {
            cb.checked = valuesArray.includes(cb.value);
        });

        const dropdownValue = dropdown.querySelector(`[data-dropdown-value="${dropdownId}"]`);
        const dropdownText = dropdown.querySelector(`[data-dropdown-text="${dropdownId}"]`);
        updateDropdownTextAndValue(checkboxes, dropdownText, dropdownValue);
    }
};

// Funcion para agregar o quitar atributos
export const toggleAttributes = (element, attribute, value, action) => {
    switch (action) {
        case 'remove':
            element.removeAttribute(attribute);
            break;
        case 'add':
            element.setAttribute(attribute, value);
            break;
    }
};

// Funcion para agregar o quitar clases
export const toggleClasses = (element, className, action) => {
    switch (action) {
        case 'remove':
            element.classList.remove(className);
            break;
        case 'add':
            element.classList.add(className);
            break;
    }
};

// Objeto exportable
const Helpers = {
    setCookie,
    getCookie,
    eraseCookie,
    setupSideMenu,
    setInnerHTML,
    closeModal,
    clearForm,
    isFormValid,
    setupDropdown,
    setupPagination,
    getSelectedCheckboxes,
    renderPartialView,
    constructUrl,
    toggleAttributes,
    toggleClasses
};

export default Helpers;