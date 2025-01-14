import { TextField, Grid, Card, FormControlLabel, Checkbox, Fade, InputAdornment, IconButton } from '@mui/material';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import { SearchRounded } from '@mui/icons-material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import TipoPersona from '../components/tipopersona';
import Page from '../../../../../components/Page'
import { URLAPIGENERAL, URLRUC } from "../../../../../config";
import { esCedula, noEsVacio, esCorreo, obtenerMaquina } from "../../../../../utils/sistema/funciones";
import { MenuMantenimiento } from "../../../../../components/sistema/menumatenimiento";
import CircularProgreso from "../../../../../components/Cargando";
import { PATH_AUTH, PATH_PAGE } from '../../../../../routes/paths'

export default function FormularioRegistroPersona() {
  document.body.style.overflowX = 'hidden';
  const usuario = JSON.parse(window.localStorage.getItem('usuario'));
  const config = {
    headers: {
      'Authorization': `Bearer ${usuario.token}`
    }
  }

  const { enqueueSnackbar } = useSnackbar();
  const navegacion = useNavigate();
  const [errorcorreo, setErrorcorreo] = React.useState(false);

  // MENSAJE GENERICO
  const mensajeSistema = (mensaje, variante) => {
    enqueueSnackbar(mensaje, {
      variant: variante,
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'center',
      },
    });
  };
  // FORMULARIO DE ENVIO
  const [formulario, setFormulario] = React.useState({
    codigo: 0,
    codigo_Usuario: '',
    nombre: '',
    apellido: '',
    tipo_persona: '',
    cedula: '',
    celular: '',
    correo: '',
    clave: '',
    direccion: '',
    observacion: '',
    fecha_ing: new Date(),
    maquina: '',
    usuario: usuario.codigo,
    estado: true,
  });
  function cambiar(param) {
    let apellido = [];
    let nombre = [];
    let nombrecompleto = param;
    nombrecompleto = nombrecompleto.split(' ');
    apellido = nombrecompleto.slice(0, 2);
    nombre = nombrecompleto.slice(2, 4);
    return [apellido.join(' '), nombre.join(' ')];
  }
  // METODO PARA OBTENER EL RUC
  const consultarCedula = async () => {
    try {
      const { data } = await axios(`${URLRUC}GetCedulas?id=${formulario.cedula}`);
      if (data.length > 0) {
        const [apellido, nombre] = cambiar(data[0].Nombre);
        console.log(apellido, nombre);
        setFormulario({
          ...formulario,
          nombre,
          apellido,
          direccion: data[0].Direccion,
        });
      } else {
        mensajeSistema('No se encontro ninguna identificacion', 'error');
        limpiarCampos();
      }
    } catch (error) {
      mensajeSistema('Revisar que la credencial sea la correcta', 'error');
      limpiarCampos();
    }
  };
  // METODO PARA LIMPIAR LOS CAMPOS
  const limpiarCampos = () => {
    setFormulario({
      codigo: 0,
      codigo_Usuario: '',
      nombre: '',
      apellido: '',
      tipo_persona: '',
      cedula: '',
      celular: '',
      correo: '',
      direccion: '',
      observacion: '',
      estado: true,
    });
  };
  const messajeTool = (variant, msg) => {
    enqueueSnackbar(msg, { variant, anchorOrigin: { vertical: 'top', horizontal: 'center' } });
  };

  // METODO PARA OBTENER EL RUC
  const [error, setError] = React.useState(false);
  // GUARDAR INFORMACION
  // eslint-disable-next-line consistent-return
  const Grabar = async () => {
    console.log(formulario);
    try {
      formulario.maquina = await obtenerMaquina()
      // const noesvacio = noEsVacio(formulario);
      const nombre = formulario.nombre.length;
      const apellido = formulario.apellido.length;
      const tipopersona = formulario.tipo_persona;
      const cedula = formulario.cedula.length;
      const celular = formulario.celular.trim();
      const correo = esCorreo(formulario.correo);

      const direccion = formulario.direccion.trim();
      // if (!noesvacio) {
      //   mensajeSistema('Complete los campos requeridos', 'error');
      //   setError(true);
      //   return false;
      // }

      if (nombre < 3) {
        messajeTool('error', 'Verifique su nombre.');
        setError(true);
        return false;
      }
      if (apellido === '') {
        messajeTool('error', 'Verifique su apellido.');
        setError(true);
        return false;
      }
      if (tipopersona === '----') {
        messajeTool('error', 'Seleccione su tipo de persona.');
        setError(true);
        return false;
      }
      if (cedula <= 9) {
        messajeTool('error', 'Verifique su cedula');
        setError(true);
        return false;
      }
      if (celular === '') {
        messajeTool('error', 'Verifique su celular.');
        setError(true);
        return false;
      }
      if (!correo) {
        messajeTool('error', 'Verifique su correo.');
        setError(true);
        return false;
      }
      if (direccion === '') {
        messajeTool('error', 'Verifique su  direccion.');
        setError(true);
        return false;
      }
      const { data } = await axios.post(`${URLAPIGENERAL}/usuarios`, formulario, config);
      if (data === 200) {
        mensajeSistema('Registros guardado correctamente', 'success');
        navegacion(`/sistema/parametros/persona`);
      }
    } catch (error) {
      if (error.response.status === 401) {
        navegacion(`${PATH_AUTH.login}`);
        mensajeSistema("Su inicio de sesion expiro", "error");
      }

      mensajeSistema("Revisar si la informacion ingresada ya se encuentra registrada", "error");

    }
  };
  const Volver = () => {
    navegacion(`/sistema/parametros/persona`);
  };
  const Nuevo = () => {
    limpiarCampos();
  };
  return (
    <>
      <Page title="Usuario">
        <MenuMantenimiento modo nuevo={() => Nuevo()} grabar={() => Grabar()} volver={() => Volver()} />
        <Fade in style={{ transformOrigin: '0 0 0' }} timeout={1000}>
          <Box sx={{ ml: 3, mr: 3, p: 1, width: '100%' }}>
            <h1>Ingreso de Persona</h1>
          </Box>
        </Fade>
        <Fade in style={{ transformOrigin: '0 0 0' }} timeout={1000}>
          <Card elevation={3} sx={{ ml: 3, mr: 3, mb: 2, p: 1 }}>
            <Box sx={{ width: '100%', p: 2 }}>
              <Grid container spacing={1}>
                <Grid container item xs={12} spacing={1}>
                  <Grid item md={2} xs={12} sm={6}>
                    <TextField
                      fullWidth
                      disabled
                      size="small"
                      type="text"
                      label="Codigo"
                      variant="outlined"
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  <Grid item md={2} xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      error={error}
                      type="text"
                      label="Codigo Usuario *"
                      onChange={(e) => {
                        setFormulario({
                          ...formulario,
                          codigo_Usuario: e.target.value,
                        });
                      }}
                      value={formulario.codigo_Usuario}
                    />
                  </Grid>
                </Grid>

                <Grid container item xs={12} spacing={1}>
                  <Grid item md={2.5} xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      error={error}
                      type="text"
                      label="Nombre *"
                      variant="outlined"
                      onChange={(e) => {
                        setFormulario({
                          ...formulario,
                          nombre: e.target.value,
                        });
                      }}
                      value={formulario.nombre}
                    />
                  </Grid>
                  <Grid item md={2.5} xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      error={error}
                      type="text"
                      label="Apellido *"
                      variant="outlined"
                      onChange={(e) => {
                        setFormulario({
                          ...formulario,
                          apellido: e.target.value,
                        });
                      }}
                      value={formulario.apellido}
                    />
                  </Grid>
                  <Grid item md={2.5} xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      error={error}
                      type="password"
                      label="Clave *"
                      variant="outlined"
                      onChange={(e) => {
                        setFormulario({
                          ...formulario,
                          clave: e.target.value,
                        });
                      }}
                      value={formulario.clave}
                    />
                  </Grid>
                </Grid>
                <Grid container item xs={12} spacing={1}>
                  <Grid item md={2.5} xs={12} sm={6}>
                    <TipoPersona data={formulario} />
                  </Grid>
                  <Grid item md={2.5} xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      error={error}
                      label="Cedula *"
                      variant="outlined"
                      onChange={(e) => {
                        setFormulario({
                          ...formulario,
                          cedula: e.target.value,
                        });
                      }}
                      value={formulario.cedula}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => consultarCedula()} size="small">
                              <SearchRounded />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                <Grid container item xs={12} spacing={1}>
                  <Grid item md={2} xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      error={error}
                      type="number"
                      label="Celular *"
                      variant="outlined"
                      onChange={(e) => {
                        setFormulario({
                          ...formulario,
                          celular: e.target.value,
                        });
                      }}
                      value={formulario.celular}
                    />
                  </Grid>
                  <Grid item md={3} xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      error={errorcorreo}
                      type="text"
                      label="Correo *"
                      variant="outlined"
                      helperText={errorcorreo ? 'correo invalido: mailto:example@example.com' : ''}
                      onChange={(e) => {
                        const input = e.target.value;
                        if (!esCorreo(input)) setErrorcorreo(true);
                        else setErrorcorreo(false);
                        setFormulario({
                          ...formulario,
                          correo: input,
                        });
                        // setValue(input)
                      }}
                      value={formulario.correo}
                    />
                  </Grid>
                </Grid>

                <Grid container item xs={12} spacing={1}>
                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      size="small"
                      error={error}
                      type="text"
                      label="Direccion *"
                      variant="outlined"
                      onChange={(e) => {
                        setFormulario({
                          ...formulario,
                          direccion: e.target.value,
                        });
                      }}
                      value={formulario.direccion}
                    />
                  </Grid>
                </Grid>

                <Grid container item xs={12} spacing={1}>
                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      size="small"
                      error={error}
                      type="text"
                      label="Observacion *"
                      variant="outlined"
                      onChange={(e) => {
                        setFormulario({
                          ...formulario,
                          observacion: e.target.value,
                        });
                      }}
                      value={formulario.observacion}
                    />
                  </Grid>
                </Grid>
                <Grid container item xs={12} spacing={1}>
                  <Grid item md={3} xs={12} sm={6}>
                    <FormControlLabel
                      onChange={(e) => {
                        setFormulario({
                          ...formulario,
                          estado: e.target.checked,
                        });
                      }}
                      value={formulario.estado}
                      control={<Checkbox defaultChecked disabled />}
                      label="Estado"
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </Card>
        </Fade>
      </Page>
    </>
  );
}