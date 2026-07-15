document.addEventListener('DOMContentLoaded', async () => {
    const loadingScreen = document.getElementById("loadingScreen");
    const body = document.body;
    body.classList.add("no-scroll");

    try {
        const settings = await fetch('/src/settings.json').then(res => res.json());

        const setContent = (id, property, value) => {
            const element = document.getElementById(id);
            if (element) element[property] = value;
        };

        const randomImageSrc = Array.isArray(settings.header.imageSrc) && settings.header.imageSrc.length > 0
            ? settings.header.imageSrc[Math.floor(Math.random() * settings.header.imageSrc.length)]
            : "";

        const dynamicImage = document.getElementById('dynamicImage');
        
        if (dynamicImage) {
            const isVideo = randomImageSrc.toLowerCase().endsWith('.mp4');
            const isAudio = randomImageSrc.toLowerCase().endsWith('.mp3') || randomImageSrc.toLowerCase().endsWith('.wav') || randomImageSrc.toLowerCase().endsWith('.ogg');

            if (isVideo) {
                dynamicImage.remove();
                const videoElement = document.createElement('video');
                videoElement.id = 'dynamicImage';
                videoElement.autoplay = true;
                videoElement.muted = true;
                videoElement.loop = true;
                videoElement.playsInline = true;
                videoElement.src = randomImageSrc;

                const parent = dynamicImage.parentNode;
                parent.insertBefore(videoElement, parent.firstChild);

                const setMediaSize = () => {
                    const screenWidth = window.innerWidth;
                    if (screenWidth < 768) {
                        videoElement.style.maxWidth = settings.header.imageSize.mobile || "80%";
                    } else if (screenWidth < 1200) {
                        videoElement.style.maxWidth = settings.header.imageSize.tablet || "40%";
                    } else {
                        videoElement.style.maxWidth = settings.header.imageSize.desktop || "40%";
                    }
                    videoElement.style.height = "auto";
                };
                setMediaSize();
                window.addEventListener('resize', setMediaSize);
            } 
            else if (isAudio) {
                dynamicImage.remove();
                const audioContainer = document.createElement('div');
                audioContainer.id = 'dynamicImage';
                audioContainer.style.display = 'flex';
                audioContainer.style.flexDirection = 'column';
                audioContainer.style.alignItems = 'center';
                audioContainer.style.gap = '10px';
                
                const audioElement = document.createElement('audio');
                audioElement.controls = true;
                audioElement.autoplay = false;
                audioElement.loop = true;
                audioElement.src = randomImageSrc;
                audioElement.style.width = '100%';
                audioElement.style.maxWidth = '300px';
                
                const playButton = document.createElement('button');
                playButton.innerHTML = '▶️ Play Music';
                playButton.style.padding = '8px 20px';
                playButton.style.backgroundColor = '#ff477e';
                playButton.style.border = 'none';
                playButton.style.borderRadius = '25px';
                playButton.style.color = 'white';
                playButton.style.cursor = 'pointer';
                playButton.style.fontWeight = 'bold';
                playButton.style.marginTop = '5px';
                
                let isPlaying = false;
                playButton.onclick = () => {
                    if (isPlaying) {
                        audioElement.pause();
                        playButton.innerHTML = '▶️ Play Music';
                        isPlaying = false;
                    } else {
                        audioElement.play();
                        playButton.innerHTML = '⏸️ Pause';
                        isPlaying = true;
                    }
                };
                
                audioElement.onended = () => {
                    if (audioElement.loop) {
                        audioElement.play();
                    } else {
                        playButton.innerHTML = '▶️ Play Music';
                        isPlaying = false;
                    }
                };
                
                audioContainer.appendChild(audioElement);
                audioContainer.appendChild(playButton);
                
                const parent = dynamicImage.parentNode;
                parent.insertBefore(audioContainer, parent.firstChild);
                
                const setMediaSize = () => {
                    const screenWidth = window.innerWidth;
                    if (screenWidth < 768) {
                        audioContainer.style.maxWidth = settings.header.imageSize.mobile || "80%";
                    } else if (screenWidth < 1200) {
                        audioContainer.style.maxWidth = settings.header.imageSize.tablet || "40%";
                    } else {
                        audioContainer.style.maxWidth = settings.header.imageSize.desktop || "40%";
                    }
                    audioContainer.style.width = "100%";
                };
                setMediaSize();
                window.addEventListener('resize', setMediaSize);
            }
            else {
                dynamicImage.src = randomImageSrc;

                const setMediaSize = () => {
                    const screenWidth = window.innerWidth;
                    if (screenWidth < 768) {
                        dynamicImage.style.maxWidth = settings.header.imageSize.mobile || "80%";
                    } else if (screenWidth < 1200) {
                        dynamicImage.style.maxWidth = settings.header.imageSize.tablet || "40%";
                    } else {
                        dynamicImage.style.maxWidth = settings.header.imageSize.desktop || "40%";
                    }
                    dynamicImage.style.height = "auto";
                };

                setMediaSize();
                window.addEventListener('resize', setMediaSize);
            }
        }
        
        setContent('page', 'textContent', settings.name || "Rynn UI");
        setContent('header', 'textContent', settings.name || "Rynn UI");
        setContent('name', 'textContent', settings.name || "Rynn UI");
        setContent('version', 'textContent', settings.version || "v1.0 Beta");
        setContent('versionHeader', 'textContent', settings.header.status || "Online!");
        setContent('description', 'textContent', settings.description || "Simple API's");

        const apiLinksContainer = document.getElementById('apiLinks');
        if (apiLinksContainer && settings.links?.length) {
            settings.links.forEach(({ url, name }) => {
                const link = Object.assign(document.createElement('a'), {
                    href: url,
                    textContent: name,
                    target: '_blank',
                    className: 'lead'
                });
                apiLinksContainer.appendChild(link);
            });
        }

        const apiContent = document.getElementById('apiContent');
        settings.categories.forEach((category) => {
            const sortedItems = category.items.sort((a, b) => a.name.localeCompare(b.name));
            const categoryContent = sortedItems.map((item, index, array) => {
                const isLastItem = index === array.length - 1;
                const itemClass = `col-md-6 col-lg-4 api-item ${isLastItem ? 'mb-4' : 'mb-2'}`;
                return `
                    <div class="${itemClass}" data-name="${item.name}" data-desc="${item.desc}" data-method="${item.method || 'GET'}" data-body-type="${item.bodyType || ''}">
                        <div class="hero-section d-flex align-items-center justify-content-between" style="height: 70px;">
                            <div>
                                <h5 class="mb-0" style="font-size: 18px;">${item.name}</h5>
                                <p class="text-muted mb-0" style="font-size: 0.8rem;">${item.desc}</p>
                            </div>
                            <button class="btn btn-dark btn-sm get-api-btn" data-api-path="${item.path}" data-api-name="${item.name}" data-api-desc="${item.desc}" data-api-method="${item.method || 'GET'}" data-api-body-type="${item.bodyType || ''}">
                                ${item.method || 'GET'}
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
            apiContent.insertAdjacentHTML('beforeend', `<h3 class="mb-3 category-header" style="font-size: 22px;">${category.name}</h3><div class="row">${categoryContent}</div>`);
        });

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                const searchTerm = searchInput.value.toLowerCase();
                const apiItems = document.querySelectorAll('.api-item');
                const categoryHeaders = document.querySelectorAll('.category-header');

                apiItems.forEach(item => {
                    const name = item.getAttribute('data-name').toLowerCase();
                    const desc = item.getAttribute('data-desc').toLowerCase();
                    item.style.display = (name.includes(searchTerm) || desc.includes(searchTerm)) ? '' : 'none';
                });

                categoryHeaders.forEach(header => {
                    const categoryRow = header.nextElementSibling;
                    const visibleItems = categoryRow.querySelectorAll('.api-item:not([style*="display: none"])');
                    header.style.display = visibleItems.length ? '' : 'none';
                });
            });
        }

        document.addEventListener('click', event => {
            if (!event.target.classList.contains('get-api-btn')) return;

            const { apiPath, apiName, apiDesc, apiMethod, apiBodyType } = event.target.dataset;
            const modal = new bootstrap.Modal(document.getElementById('apiResponseModal'));
            const modalRefs = {
                label: document.getElementById('apiResponseModalLabel'),
                desc: document.getElementById('apiResponseModalDesc'),
                content: document.getElementById('apiResponseContent'),
                endpoint: document.getElementById('apiEndpoint'),
                spinner: document.getElementById('apiResponseLoading'),
                queryInputContainer: document.getElementById('apiQueryInputContainer'),
                submitBtn: document.getElementById('submitQueryBtn')
            };

            modalRefs.label.textContent = apiName;
            modalRefs.desc.textContent = apiDesc;
            modalRefs.content.textContent = '';
            modalRefs.endpoint.textContent = '';
            modalRefs.spinner.classList.add('d-none');
            modalRefs.content.classList.add('d-none');
            modalRefs.endpoint.classList.add('d-none');

            modalRefs.queryInputContainer.innerHTML = '';
            modalRefs.submitBtn.classList.add('d-none');

            let baseApiUrl = `${window.location.origin}${apiPath}`;
            let params = new URLSearchParams(apiPath.split('?')[1]);
            let hasParams = params.toString().length > 0;

            const isPostMethod = apiMethod === 'POST';

            if (isPostMethod && apiBodyType === 'form-data') {
                const formContainer = document.createElement('div');
                formContainer.className = 'param-container';
                
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.className = 'form-control mb-2';
                fileInput.id = 'uploadFile';
                fileInput.accept = 'image/*,video/*,audio/*,application/*';
                
                const infoText = document.createElement('small');
                infoText.className = 'text-muted d-block';
                infoText.style.fontSize = '12px';
                infoText.textContent = 'Max file size: 10MB';
                
                formContainer.appendChild(fileInput);
                formContainer.appendChild(infoText);
                
                const currentItem = settings.categories
                    .flatMap(category => category.items)
                    .find(item => item.path === apiPath);
                    
                if (currentItem && currentItem.innerDesc) {
                    const innerDescDiv = document.createElement('div');
                    innerDescDiv.className = 'text-muted mt-2';
                    innerDescDiv.style.fontSize = '13px';
                    innerDescDiv.innerHTML = currentItem.innerDesc.replace(/\n/g, '<br>');
                    formContainer.appendChild(innerDescDiv);
                }
                
                modalRefs.queryInputContainer.appendChild(formContainer);
                modalRefs.submitBtn.classList.remove('d-none');
                modalRefs.submitBtn.disabled = false;
                
                modalRefs.submitBtn.onclick = async () => {
                    const file = document.getElementById('uploadFile').files[0];
                    
                    if (!file) {
                        modalRefs.content.textContent = 'Please select a file to upload.';
                        modalRefs.content.classList.remove('d-none');
                        return;
                    }
                    
                    const formData = new FormData();
                    formData.append('file', file);
                    
                    modalRefs.queryInputContainer.innerHTML = '';
                    modalRefs.submitBtn.classList.add('d-none');
                    
                    await handlePostRequest(baseApiUrl, formData, modalRefs, apiName);
                };
                
            } else if (hasParams && !isPostMethod) {
                const paramContainer = document.createElement('div');
                paramContainer.className = 'param-container';

                const paramsArray = Array.from(params.keys());
                
                paramsArray.forEach((param, index) => {
                    const paramGroup = document.createElement('div');
                    paramGroup.className = index < paramsArray.length - 1 ? 'mb-2' : '';

                    const inputField = document.createElement('input');
                    inputField.type = 'text';
                    inputField.className = 'form-control';
                    inputField.placeholder = `Enter ${param}...`;
                    inputField.dataset.param = param;
                    inputField.required = true;
                    inputField.addEventListener('input', validateInputs);

                    paramGroup.appendChild(inputField);
                    paramContainer.appendChild(paramGroup);
                });
                
                const currentItem = settings.categories
                    .flatMap(category => category.items)
                    .find(item => item.path === apiPath);

                if (currentItem && currentItem.innerDesc) {
                    const innerDescDiv = document.createElement('div');
                    innerDescDiv.className = 'text-muted mt-2';
                    innerDescDiv.style.fontSize = '13px';
                    innerDescDiv.innerHTML = currentItem.innerDesc.replace(/\n/g, '<br>');
                    paramContainer.appendChild(innerDescDiv);
                }

                modalRefs.queryInputContainer.appendChild(paramContainer);
                modalRefs.submitBtn.classList.remove('d-none');

                modalRefs.submitBtn.onclick = async () => {
                    const inputs = modalRefs.queryInputContainer.querySelectorAll('input');
                    const newParams = new URLSearchParams();
                    let isValid = true;

                    inputs.forEach(input => {
                        if (!input.value.trim()) {
                            isValid = false;
                            input.classList.add('is-invalid');
                        } else {
                            input.classList.remove('is-invalid');
                            newParams.append(input.dataset.param, input.value.trim());
                        }
                    });

                    if (!isValid) {
                        modalRefs.content.textContent = 'Please fill in all required fields.';
                        modalRefs.content.classList.remove('d-none');
                        return;
                    }

                    const apiUrlWithParams = `${window.location.origin}${apiPath.split('?')[0]}?${newParams.toString()}`;
                    
                    modalRefs.queryInputContainer.innerHTML = '';
                    modalRefs.submitBtn.classList.add('d-none');
                    handleGetRequest(apiUrlWithParams, modalRefs, apiName);
                };
            } else {
                handleGetRequest(baseApiUrl, modalRefs, apiName);
            }

            modal.show();
        });

        function validateInputs() {
            const submitBtn = document.getElementById('submitQueryBtn');
            if (!submitBtn) return;
            const inputs = document.querySelectorAll('.param-container input[type="text"]');
            if (inputs.length > 0) {
                const isValid = Array.from(inputs).every(input => input.value.trim() !== '');
                submitBtn.disabled = !isValid;
            }
        }

        async function handleGetRequest(apiUrl, modalRefs, apiName) {
            modalRefs.spinner.classList.remove('d-none');
            modalRefs.content.classList.add('d-none');

            try {
                const response = await fetch(apiUrl);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const contentType = response.headers.get('Content-Type');
                
                if (contentType && contentType.startsWith('image/')) {
                    const blob = await response.blob();
                    const imageUrl = URL.createObjectURL(blob);
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.alt = apiName;
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                    img.style.borderRadius = '5px';
                    modalRefs.content.innerHTML = '';
                    modalRefs.content.appendChild(img);
                } 
                else if (contentType && contentType.startsWith('video/')) {
                    const blob = await response.blob();
                    const videoUrl = URL.createObjectURL(blob);
                    const video = document.createElement('video');
                    video.src = videoUrl;
                    video.controls = true;
                    video.autoplay = true;
                    video.loop = true;
                    video.style.maxWidth = '100%';
                    video.style.height = 'auto';
                    video.style.borderRadius = '5px';
                    modalRefs.content.innerHTML = '';
                    modalRefs.content.appendChild(video);
                }
                else if (contentType && contentType.startsWith('audio/')) {
                    const blob = await response.blob();
                    const audioUrl = URL.createObjectURL(blob);
                    const audioContainer = document.createElement('div');
                    audioContainer.style.display = 'flex';
                    audioContainer.style.flexDirection = 'column';
                    audioContainer.style.alignItems = 'center';
                    audioContainer.style.gap = '10px';
                    
                    const audio = document.createElement('audio');
                    audio.src = audioUrl;
                    audio.controls = true;
                    audio.autoplay = false;
                    audio.style.width = '100%';
                    audio.style.maxWidth = '300px';
                    
                    const playButton = document.createElement('button');
                    playButton.innerHTML = '▶️ Play Music';
                    playButton.style.padding = '10px 20px';
                    playButton.style.backgroundColor = '#ff477e';
                    playButton.style.border = 'none';
                    playButton.style.borderRadius = '25px';
                    playButton.style.color = 'white';
                    playButton.style.cursor = 'pointer';
                    playButton.style.fontWeight = 'bold';
                    
                    let isPlaying = false;
                    playButton.onclick = () => {
                        if (isPlaying) {
                            audio.pause();
                            playButton.innerHTML = '▶️ Play Music';
                            isPlaying = false;
                        } else {
                            audio.play();
                            playButton.innerHTML = '⏸️ Pause';
                            isPlaying = true;
                        }
                    };
                    
                    audio.onended = () => {
                        playButton.innerHTML = '▶️ Play Music';
                        isPlaying = false;
                    };
                    
                    audioContainer.appendChild(audio);
                    audioContainer.appendChild(playButton);
                    
                    modalRefs.content.innerHTML = '';
                    modalRefs.content.appendChild(audioContainer);
                }
                else {
                    const data = await response.json();
                    modalRefs.content.textContent = JSON.stringify(data, null, 2);
                }

                modalRefs.endpoint.textContent = apiUrl;
                modalRefs.endpoint.classList.remove('d-none');
            } catch (error) {
                modalRefs.content.textContent = `Error: ${error.message}`;
            } finally {
                modalRefs.spinner.classList.add('d-none');
                modalRefs.content.classList.remove('d-none');
            }
        }

        async function handlePostRequest(apiUrl, formData, modalRefs, apiName) {
            modalRefs.spinner.classList.remove('d-none');
            modalRefs.content.classList.add('d-none');

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const contentType = response.headers.get('Content-Type');
                
                if (contentType && contentType.startsWith('image/')) {
                    const blob = await response.blob();
                    const imageUrl = URL.createObjectURL(blob);
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.alt = apiName;
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                    img.style.borderRadius = '5px';
                    modalRefs.content.innerHTML = '';
                    modalRefs.content.appendChild(img);
                } 
                else if (contentType && contentType.startsWith('video/')) {
                    const blob = await response.blob();
                    const videoUrl = URL.createObjectURL(blob);
                    const video = document.createElement('video');
                    video.src = videoUrl;
                    video.controls = true;
                    video.autoplay = true;
                    video.loop = true;
                    video.style.maxWidth = '100%';
                    video.style.height = 'auto';
                    video.style.borderRadius = '5px';
                    modalRefs.content.innerHTML = '';
                    modalRefs.content.appendChild(video);
                }
                else if (contentType && contentType.startsWith('audio/')) {
                    const blob = await response.blob();
                    const audioUrl = URL.createObjectURL(blob);
                    const audioContainer = document.createElement('div');
                    audioContainer.style.display = 'flex';
                    audioContainer.style.flexDirection = 'column';
                    audioContainer.style.alignItems = 'center';
                    audioContainer.style.gap = '10px';
                    
                    const audio = document.createElement('audio');
                    audio.src = audioUrl;
                    audio.controls = true;
                    audio.autoplay = false;
                    audio.style.width = '100%';
                    audio.style.maxWidth = '300px';
                    
                    const playButton = document.createElement('button');
                    playButton.innerHTML = '▶️ Play Music';
                    playButton.style.padding = '10px 20px';
                    playButton.style.backgroundColor = '#ff477e';
                    playButton.style.border = 'none';
                    playButton.style.borderRadius = '25px';
                    playButton.style.color = 'white';
                    playButton.style.cursor = 'pointer';
                    playButton.style.fontWeight = 'bold';
                    
                    let isPlaying = false;
                    playButton.onclick = () => {
                        if (isPlaying) {
                            audio.pause();
                            playButton.innerHTML = '▶️ Play Music';
                            isPlaying = false;
                        } else {
                            audio.play();
                            playButton.innerHTML = '⏸️ Pause';
                            isPlaying = true;
                        }
                    };
                    
                    audio.onended = () => {
                        playButton.innerHTML = '▶️ Play Music';
                        isPlaying = false;
                    };
                    
                    audioContainer.appendChild(audio);
                    audioContainer.appendChild(playButton);
                    
                    modalRefs.content.innerHTML = '';
                    modalRefs.content.appendChild(audioContainer);
                }
                else {
                    const data = await response.json();
                    modalRefs.content.textContent = JSON.stringify(data, null, 2);
                }

                modalRefs.endpoint.textContent = apiUrl;
                modalRefs.endpoint.classList.remove('d-none');
            } catch (error) {
                modalRefs.content.textContent = `Error: ${error.message}`;
            } finally {
                modalRefs.spinner.classList.add('d-none');
                modalRefs.content.classList.remove('d-none');
            }
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    } finally {
        setTimeout(() => {
            if (loadingScreen) loadingScreen.style.display = "none";
            body.classList.remove("no-scroll");
        }, 2000);
    }
});

window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const navbarBrand = document.querySelector('.navbar-brand');
    if (window.scrollY > 0) {
        if (navbarBrand) navbarBrand.classList.add('visible');
        if (navbar) navbar.classList.add('scrolled');
    } else {
        if (navbarBrand) navbarBrand.classList.remove('visible');
        if (navbar) navbar.classList.remove('scrolled');
    }
});
