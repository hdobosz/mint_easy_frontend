import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import './loginForm.scss';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosInstance';
import { instance } from '../../axiosInstance';
import { useNavbarContext } from "../../contexts/NavbarContext";



// declare the type of the form data

type LoginFormData = {
  username: string;
  password: string;
};

// declare the type of the props
type LoginFormProps = {
  slug: string;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleLogin: (username: string) => void;
};

// set the initial state of the form data

const LoginForm: React.FC<LoginFormProps> = (props) => {
  const {msg, setMsg } = useNavbarContext();

  // const queryClient = useQueryClient();
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  });
  const navigate = useNavigate(); // Declare navigate function from react-router-dom
  const [error, setErrors] = useState<any>(null); // State to store error message

  useEffect(() => {
    // Fetch CSRF token and set it in cookies
    axiosInstance.get('/get-csrf-token/')
      .then((response) => {
        const csrfToken = response.data.csrfToken;
        Cookies.set('csrfToken', csrfToken, { expires: 1, path: '/' });
      })
      .catch((error) => {
        console.error('Error fetching CSRF token:', error);
      });
  }, []);

  const mutation = useMutation({
    mutationFn: () => {
      return instance.post('/dj-rest-auth/login/', formData)
        .then((response) => {
          console.log(response);
          const responseData = response.data;
          console.log("test");
          if (responseData.key) { // If a key is returned, login was successful
            Cookies.set('authToken', responseData.key, { expires: 1, path: '/' }); // Store the token in cookie with expiry of 1 day
            Cookies.set('username', formData.username, { expires: 1, path: '/' }); // Store the username in cookie with expiry of 1 day
            props.handleLogin(formData.username); // Call handleLogin function from props
            navigate('/dashboard'); // redirection to dashboard page
          }
          return response;
        })
        .catch((error) => {
          console.log(error);
          
            setErrors(error.response.data);

        });
    },
    onSuccess: () => {
//      queryClient.invalidateQueries([`all${props.slug}s`]); // Invalidate cache for all users preparing it for a refetch
    },
  });
  

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission
    setMsg(''); // Reset msg

    try {
      await mutation.mutateAsync(); // Execute the mutation and wait for it to finish

    } catch (error) {
      if (error instanceof Error) {
        setErrors(error.message); // Set error message
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setFormData({ ...formData, [field]: e.target.value }); // Update form data
  };

  // const setFormOpen = (open: boolean) => {
  //   props.setOpen(open); // Set the open state of the form
  // };


  return (


    <div className="loginForm">
      <div className="modal">
      {msg && <div className="msg">{msg}</div>}

        <span className="close" onClick={() => props.setOpen(false)}> {/* close the form */}
          x
        </span>
        <h1>{props.slug}</h1>
        <form onSubmit={handleSubmit}>
          <div className="item">
            <label>Username</label>
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => handleInputChange(e, 'username')}
              required
            />
          </div>

          <div className="item">
            <label>Password</label>
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleInputChange(e, 'password')}
              required
            />
            
          </div>
 
          <button type="submit">Send</button>
          {/* display errors*/}
          {error && <p>{error.non_field_errors}</p>}
          {error && <p>{error.detail}</p>}

          
        </form>
      </div>
    </div>
  );
};

export default LoginForm;