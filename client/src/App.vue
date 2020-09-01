<template>
    <div id="app">
        <div id="seachat">
            <header>
                <h1>海洋聊天室</h1>
                <h2>{{me}}</h2>
            </header>
            <content>
                <div id="message-container" ref="messages">
                    <div class="message" v-for="message in messages" :key="message.id">
                        <p>
                            <span class="meta sender">{{message.sender}}</span>
                            <span class="meta time">{{message.time}}</span>
                        </p>
                        <p class="content">{{message.content}}</p>
                    </div>
                </div>
                <div id="users">
                    <p class="user" v-for="id in users.filter(id=>id!=me)" :key="id">{{id}}</p>
                </div>
            </content>
            <footer>
                <input type="text" v-model="message" ref="messageInput" @keyup.enter="sendMessage" />
                <button @click="sendMessage">发送信息</button>
            </footer>
        </div>
    </div>
</template>

<script>
import socketio from "socket.io-client";
const io = socketio("localhost:3000");

export default {
    name: "app",
    data() {
        return {
            me: "",
            users: [],
            message: "",
            messages: [],
        };
    },
    created() {
        io.on("id", (id) => (this.me = id));
        io.on("users", (users) => (this.users = users));
        io.on("message", (message) => this.messages.push(message));
    },
    updated() {
        this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight;
    },
    methods: {
        sendMessage() {
            if (this.message) {
                io.emit("message", this.message);
                this.message = "";
                this.$refs.messageInput.focus();
            }
        },
    },
};
</script>

<style lang="scss">
:root {
    --dark-color-a: #667aff;
    --dark-color-b: #7386ff;
    --light-color: #e6e9ff;
    --success-color: #5cb85c;
    --error-color: #d9534f;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: "Roboto", sans-serif;
    font-size: 16px;
    background: var(--light-color);
    margin: 20px;
}

#seachat {
    max-width: 1100px;
    background: #fff;
    margin: 30px auto;
    overflow: hidden;

    header {
        background: var(--dark-color-a);
        color: #fff;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
        padding: 15px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    content {
        display: grid;
        grid-template-columns: 2fr 1fr;
        height: 600px;
        #message-container {
            padding: 30px;
            overflow-x: hidden;
            overflow-y: auto;
            .message {
                padding: 10px;
                margin-bottom: 15px;
                background-color: var(--light-color);
                border-radius: 5px;
                p {
                    font-size: 15px;
                    font-weight: bold;
                    .meta {
                        opacity: 0.7;
                    }
                    .sender {
                        color: var(--dark-color-b);
                    }
                    .time {
                        color: #777;
                    }
                }
            }
        }
        #users {
            background: var(--dark-color-b);
            color: #fff;
            padding: 20px 20px 60px;
            overflow-x: hidden;
            overflow-y: auto;
            .user {
                padding: 10px;
                margin-bottom: 15px;
                background-color: var(--dark-color-a);
                border-radius: 5px;
            }
        }
    }
    footer {
        padding: 20px;
        display: flex;
        background-color: var(--dark-color-a);

        input {
            font-size: 16px;
            padding: 1rem;
            height: 3rem;
            border: none;
            flex: 1;
        }

        button {
            cursor: pointer;
            padding: 5px 15px;
            background: var(--light-color);
            color: var(--dark-color-a);
            border: none;
            outline: none;
            font-size: 17px;
        }
    }
}
</style>
