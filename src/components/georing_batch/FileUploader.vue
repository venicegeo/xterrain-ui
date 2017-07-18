<template>
    <div class="FileUploader">
        <span class="FileUploader__caption">Files</span>

        <button class="FileUploader__addButton" @click="browse">Add Files</button>

        <ul class="FileUploader__files">
            <li
                v-for="file in files"
                class="FileUploader__file"
                :class="{
                    'FileUploader__file--uploading': file.uploading,
                    'FileUploader__file--error': !!file.error,
                }">
                <span class="FileUploader__puck" :style="`width: ${file.progress * 100}%`"/>
                <div class="FileUploader__fileLabel">
                    <span class="FileUploader__fileIcon"><i class="fa fa-file-text"/></span>
                    <span class="FileUploader__fileName">{{file.name}}</span>
                    <span class="FileUploader__fileSize">{{ file.size | toFilesize }}</span>
                </div>
                <div class="FileUploader__fileError" v-if="file.error">{{file.error}}</div>
                <button class="FileUploader__removeButton" @click="() => removeFile(file)"><i class="fa fa-close"/></button>
            </li>
            <li class="FileUploader__placeholder" v-if="!files.length">No files have been added yet</li>
        </ul>

        <LoadingMask
            small
            class="FileUploader__loadingMask"
            v-if="isFetching"
            caption="Getting list of uploaded files."
        />
    </div>
</template>

<script>
    import axios from 'axios'

    import LoadingMask from '../LoadingMask.vue'

    export default {
        components: {
            LoadingMask,
        },
        props: {
            onChange: Function,
        },
        filters: {
            toFilesize(n) {
                return Math.ceil(n / 1024) + 'KB'
            },
        },
        mounted() {
            this.fetchFiles()
        },
        data() {
            return {
                mimetypes: 'text/csv,text/plain',
                files: [],
                isFetching: false,
            }
        },
        methods: {
            browse() {
                const element = document.createElement('input')
                element.type = 'file'
                element.multiple = true
                element.accept = this.mimetypes
                element.style.position = 'absolute'
                element.style.bottom = '0'
                element.style.right = '0'
                element.style.width = '0'
                element.style.height = '0'
                element.style.overflow = 'hidden'
                element.style.visibility = 'hidden'
                element.style.zIndex = '-1'
                element.onchange = (e) => {
                    for (let i = 0; i < e.target.files.length; i++) {
                        const content = e.target.files[i]

                        const file = {
                            error:     null,
                            id:        null,
                            uploading: true,
                            name:      content.name,
                            size:      content.size,
                        }
                        this.files.push(file)

                        // Actually upload the file
                        const data = new FormData()
                        data.append('file', content)

                        const onUploadProgress = (event) => {
                            file.progress = event.loaded / event.total
                        }

                        axios.post('/api/georing/files', data, { onUploadProgress })
                            .then(response => {
                                file.id = response.data.file.id
                                file.uploading = false
                                this.onChange()
                            })
                            .catch(err => {
                                file.uploading = false

                                if (!err.response) {
                                    file.error = 'An application error has occurred. Please contact an admin'
                                    return
                                }

                                switch (err.response.status) {
                                case 409:
                                    file.error = 'This file was already uploaded'
                                    break
                                case 422:
                                    file.error = `File could not be parsed: ${err.response.data.error}`
                                    break
                                default:
                                    file.error = 'A server error has occurred. Please contact an administrator.'
                                    break
                                }
                            })
                    }
                    element.onchange = null
                    document.body.removeChild(e.target)
                }
                document.body.appendChild(element)
                element.click()
            },
            fetchFiles() {
                this.isFetching = true
                axios.get('/api/georing/files')
                    .then(response => {
                        this.isFetching = false
                        this.files = response.data.files
                        this.onChange()
                    })
                    .catch(err => {
                        this.isFetching = false
                        console.error('[FileUploader] Could not fetch files:', err.response.data)
                    })
            },
            removeFile(file) {
                this.files = this.files.filter(f => f !== file)

                // If file was not uploaded, don't attempt to delete
                if (!file.id) {
                    // TODO -- cancel upload if upload request is still in flight
                    return
                }

                axios.delete(`/api/georing/files/${file.id}`)
                    .then(() => {
                        this.onChange()
                    })
                    .catch(err => {
                        console.error('[FileUploader] Delete failed:', err.response.data)

                        switch (err.response.status) {
                        case 403:
                            file.error = 'Cannot delete: Only the original uploader or an administrator can delete this file'
                            break
                        case 404:
                            file.error = 'Cannot delete: File not found'
                            break
                        default:
                            file.error = 'Cannot delete: A server error has occurred. Please contact an administrator.'
                        }

                        // Return the file to the stack
                        this.files.push(file)
                    })
            },
        },
    }
</script>

<style>
    .FileUploader {
        position: relative;
    }

    .FileUploader__files {
        position: relative;
        list-style: none;
        margin: 1em 0;
        padding: 0;
    }

    .FileUploader__placeholder {
        padding: .5em;
        text-align: center;
        color: #444;
    }

    .FileUploader__file {
        position: relative;
        text-overflow: ellipsis;
        overflow-x: hidden;
        background-color: #111;
    }

    .FileUploader__file--error {
        background-color: #D84315;
    }

    .FileUploader__puck {
        z-index: 1;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 0;
        background-color: #555;
        opacity: 0;
        transition: .5s linear;
    }

    .FileUploader__file--uploading .FileUploader__puck {
        opacity: 1;
    }

    .FileUploader__fileLabel {
        position: relative;
        z-index: 2;
        padding: .5em;
    }

    .FileUploader__file--error .FileUploader__fileLabel {
        opacity: .5;
    }

    .FileUploader__fileError {
        margin: .75em;
        padding: 0 .75em;
        border-left: 3px solid;
        font-size: .9em;
    }

    .FileUploader__file + .FileUploader__file {
        margin-top: 1px;
    }

    .FileUploader__fileIcon {
        margin-right: .2em;
        opacity: .1;
    }

    .FileUploader__file--error .FileUploader__fileIcon {
        opacity: 1;
    }

    .FileUploader__fileSize {
        opacity: .4;
    }

    .FileUploader__removeButton {
        z-index: 3;
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 30px;
        color: #D84315;
        cursor: pointer;
        border: none;
        border-left: 1px solid #111;
        background: transparent;
        outline: none;
    }

    /*
      2017-03-01 -- Using right-side spacing to offset remove button
      because of requirement to support IE; if that's dropped, switch
      to flexbox.
     */
    .FileUploader__file {
        padding-right: 30px;
    }

    .FileUploader__removeButton:hover {
        background-color: #D84315;
        color: white;
    }

    .FileUploader__file--error .FileUploader__removeButton {
        border-left: 1px solid #111;
        color: white;
    }

    .FileUploader__file--error .FileUploader__removeButton:hover {
        background-color: white;
        color: #D84315;
    }

    .FileUploader__loadingMask {
        z-index: 4;
    }
</style>
