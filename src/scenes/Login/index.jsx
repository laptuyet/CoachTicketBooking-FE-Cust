import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Formik } from "formik";
import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import * as yup from "yup";
import * as authApi from "../../queries/auth/authQueries";
import * as userApi from "../../queries/user/userQueries";
import { tokens } from "../../theme";
import { debounce } from "../../utils/debounce";
import { handleToast } from "../../utils/helpers";
import useLogin from "../../utils/useLogin";
import { messages } from "../../utils/validationMessages";

const initialValues = {
  username: "",
  password: "",
};

const checkExistUsernameDebounced = debounce(authApi.checkExistUsername, 500);

const authSchema = yup.object().shape({
  username: yup
    .string()
    .required(messages.common.required)
    .test("username", "Tài khoản không tồn tại", async (value) => {
      const isAvailable = await checkExistUsernameDebounced(value);
      return isAvailable;
    }),
  password: yup.string().required(messages.common.required),
});

const Login = () => {
  const colors = tokens();
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const isLoggedIn = useLogin();

  const loginMutation = useMutation({
    mutationFn: (authReq) => authApi.login(authReq),
  });

  // const getUserInfo = async (username) => {
  //   const data = await userApi.getUser(username);
  //   queryClient.setQueryData(["loggedInUser"], data);
  // };

  const handleFormSubmit = (values, actions) => {
    loginMutation.mutate(values, {
      onSuccess: (data) => {
        const accessToken = data.token;
        localStorage.setItem("accessToken", accessToken);
        handleToast("success", "Đăng nhập thành công");
        // get user info
        localStorage.setItem("loggedInUsername", values.username);

        if (location.state?.from) {
          navigate(location.state.from);
        } else navigate("/");
      },
      onError: (error) => {
        console.log(error);
        if (error.response?.status === 403) {
          handleToast("error", "Mật khẩu sai");
        } else handleToast("error", error.response?.data?.message);
      },
    });
  };

  return !isLoggedIn ? (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="500px"
    >
      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={authSchema}
        enableReinitialize={true}
      >
        {({
          values,
          errors,
          touched,
          setFieldValue,
          handleChange,
          handleBlur,
          handleSubmit,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              width="400px"
              p="20px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              bgcolor={colors.primary[100]}
              borderRadius="8px"
            >
              <Box gridColumn="span 4" textAlign="center" m="20px 0">
                <Typography variant="h2" fontWeight="bold">
                  Đăng nhập
                </Typography>
              </Box>

              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label="Tài khoản *"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.username}
                name="username"
                error={!!touched.username && !!errors.username}
                helperText={touched.username && errors.username}
                sx={{
                  gridColumn: "span 4",
                }}
              />

              <FormControl
                color="warning"
                sx={{ gridColumn: "span 4" }}
                variant="outlined"
                size="small"
              >
                <InputLabel
                  error={!!touched.password && !!errors.password}
                  htmlFor="outlined-adornment-password"
                >
                  Mật khẩu *
                </InputLabel>
                <OutlinedInput
                  id="outlined-adornment-password"
                  type={showPwd ? "text" : "password"}
                  label="Mật khẩu *"
                  fullWidth
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.password}
                  name="password"
                  error={!!touched.password && !!errors.password}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPwd(!showPwd)}
                        edge="end"
                      >
                        {showPwd ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                {!!touched.password && !!errors.password && (
                  <FormHelperText error>{errors.password}</FormHelperText>
                )}
              </FormControl>

              <Box gridColumn="span 4" textAlign="center" m="10px">
                <Button
                  disableElevation
                  disableRipple
                  variant="contained"
                  color="success"
                  type="submit"
                >
                  Đăng nhập
                </Button>
              </Box>

              <Box
                mb="10px"
                display="flex"
                gridColumn="span 4"
                justifyContent="center"
              >
                <Typography component="span" variant="h5">
                  Chưa có tài khoản ?
                  <Link to="/register">
                    <Typography component="span" variant="h5">
                      {" "}
                      Đăng ký
                    </Typography>
                  </Link>
                </Typography>
              </Box>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  ) : (
    <Navigate to="/" />
  );
};

export default Login;
