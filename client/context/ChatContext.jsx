import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios } = useContext(AuthContext);

  // Fetch all users and unseen message count
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Fetch messages for selected user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Send a message to selected user
  const sendMessage = async (messageData) => {
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );
      if (data.success) {
        setMessages((prev) => [...prev, data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Subscribe to socket messages
  const subscribeToMessages = () => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: prev[newMessage.senderId]
            ? prev[newMessage.senderId] + 1
            : 1,
        }));
      }
    });
  };

  // Unsubscribe from socket messages
  const unsubscribeFromMessages = () => {
    if (socket) socket.off("newMessage");
  };

  // 🔥 FIXED: Avoid duplicate useEffect — only keep one
  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [socket, selectedUser]); // also depend on selectedUser for real-time updates

  // 🔥 NEW: Fetch messages when a user is selected (fixes 401 error from undefined ID)
  useEffect(() => {
    if (!selectedUser?._id) return;
    getMessages(selectedUser._id);
  }, [selectedUser]);

  // Provide context values
  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    getMessages,
    sendMessage,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  };

  return (
    <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
  );
};


// import { createContext, useContext, useEffect, useState } from "react";
// import { AuthContext } from "./AuthContext";
// import toast from "react-hot-toast";


// export const ChatContext = createContext();

// export const ChatProvider = ({ children })=>{

//     const [messages, setMessages] = useState([]);
//     const [users, setUsers] = useState([]);
//     const [selectedUser, setSelectedUser] = useState(null)
//     const [unseenMessages, setUnseenMessages] = useState({})

//     const {socket, axios} = useContext(AuthContext);

//     // Function to get alll user for side bar

//     const getUsers = async ()=>{
//         try {
//             const {data} = await axios.get("/api/messages/users");
//             if(data.success){
//                 setUsers(data.users)
//                 setUnseenMessages(data.unseenMessages)
//             }
//         } catch (error) {
//             toast.error(error.message)
//         }
//     }

//     // Function to get messages for selected user

//     const getMessages = async (userId) =>{
//         try {
//             const {data} = await axios.get(`/api/messages/${userId}`);
//             if(data.success){
//                 setMessages(data.messages)
//             }
//         } catch (error) {
//             toast.error(error.message)
//         }
//     }

//     // Function to send message to selected user

//     const sendMessage = async (messageData) =>{
//         try {
//             const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`,messageData);
//             if(data.success){
//                 setMessages((prevMessages)=>[...prevMessages, data.newMessage])
//             }else{
//                 toast.error(data.message);
//             }

//         } catch (error) {
//             toast.error(error.message);
//         }
//     }
    
//     // function to  subscribe to message for selected user

//     const subscribeToMessages = async ()=>{
//         if(!socket) return;
//         socket.on("newMessage", (newMessage)=>{
//             if(selectedUser && newMessage.senderId === selectedUser._id){
//                 newMessage.seen = true;
//                 setMessages((prevMessages)=>[...prevMessages, newMessage]);
//                 axios.put(`/api/messages/mark/${newMessage._id}`);
//             }else{
//                 setUnseenMessages((prevUnseenMessages)=>({
//                     ...prevUnseenMessages, [newMessage.senderId] : prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
//                 }))
//             }
//         })
//     }

//     // Function to unsunbscribe from messages

//     const unsubscribeFromMessages = ()=>{
//         if(socket) socket.off("newMessage");
//     }

//     useEffect(()=>{
//         subscribeToMessages();
//         return () => unsubscribeFromMessages();
//     },[socket])

//     useEffect(() => {
//     subscribeToMessages();
//     return () => unsubscribeFromMessages();
//     }, [socket])

//     const value = {
//         messages, users, selectedUser, getUsers, getMessages, sendMessage, setSelectedUser, unseenMessages, setUnseenMessages
//     }
//     return (
//         <ChatContext.Provider value={value}>
//         {children}
//     </ChatContext.Provider>
//     )
// }