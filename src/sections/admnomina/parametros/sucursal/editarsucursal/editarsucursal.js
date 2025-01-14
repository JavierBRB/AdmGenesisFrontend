import { TextField, Grid, Card, FormControlLabel, Checkbox, Fade } from '@mui/material';
import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { MenuMantenimiento } from "../../../../../components/sistema/menumatenimiento";
import { URLAPIGENERAL } from '../../../../../config';
import Page from '../../../../../components/Page';
import { noEsVacio, esCorreo } from "../../../../../utils/sistema/funciones";
import { PATH_AUTH, PATH_PAGE } from '../../../../../routes/paths';

export default function FormularioSucursal() {
  document.body.style.overflowX = 'hidden';
  const usuario = JSON.parse(window.localStorage.getItem('usuario'));
  const config = {
    headers: {
      'Authorization': `Bearer ${usuario.token}`
    }
  }
  const navegacion = useNavigate();
  const { state } = useLocation()
  const { id } = state;
  const { enqueueSnackbar } = useSnackbar();
  const [error, setError] = React.useState(false);
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
    nombre: '',
    telefono: '',
    punto_emision: '',
    celular: '',
    administrador: '',
    correo: '',
    direccion: '',
    estado: true,
    esmatriz: true,
    canton: "--",
    nombrecanton: "----",
  });

  const messajeTool = (variant, msg) => {
    enqueueSnackbar(msg, { variant, anchorOrigin: { vertical: 'top', horizontal: 'center' } });
  };

  // GUARDAR INFORMACION
  // eslint-disable-next-line consistent-return
  const Grabar = async () => {
    console.log(formulario);
    try {
      const noesvacio = noEsVacio(formulario);
      const nombre = formulario.nombre.length;
      const telefono = formulario.telefono.length;
      const puntoemision = formulario.punto_emision.length;
      const celular = formulario.celular.length;
      const administrador = formulario.administrador.trim();
      const correo = esCorreo(formulario);
      const direccion = formulario.direccion.trim();
      if (!noesvacio) {
        mensajeSistema('Complete los campos requeridos', 'error');
        setError(true);
        return false;
      }
      if (nombre < 3) {
        messajeTool('error', 'El Nombre debe tener al menos 3 caracteres.');
        setError(true);
        return false;
      }
      if (telefono <= 8) {
        messajeTool('error', 'El telefono tener al menos 9 digitos.');
        setError(true);
        return false;
      }
      if (puntoemision < 3 || puntoemision > 3) {
        messajeTool('error', 'Ingrese correctamente su punto emision.');
        setError(true);
        return false;
      }
      if (celular <= 9) {
        messajeTool('error', 'el Celular debe tener 10 digitos como minimo');
        return false;
      }
      if (administrador === '') {
        messajeTool('error', 'Debe Ingresar el administrador.');
        return false;
      }
      if (correo === '') {
        messajeTool('error', 'Debe Ingresar un correo.');
        return false;
      }
      if (direccion === '') {
        messajeTool('error', 'Debe Ingresar una direccion.');
        return false;
      }
      const { data } = await axios.post(`${URLAPIGENERAL}/sucursales/editar`, formulario, config);
      if (data === 200) {
        mensajeSistema('Registros guardado correctamente', 'success');
        navegacion(`/sistema/parametros/sucursal`);
      }
    } catch (error) {
      if (error.response.status === 401) {
        navegacion(`${PATH_AUTH.login}`);
        mensajeSistema("Su inicio de sesion expiro", "error");
      }
      else if (error.response.status === 500) {
        navegacion(`${PATH_PAGE.page500}`);
      } else {
        mensajeSistema("Problemas con la base de datos", "error");
      }
    }
  };
  // const Eliminar = () => {
  //   mensajeSistema('Eliminado Correctamente', 'success');
  //   limpiarCampos();
  // };
  React.useEffect(() => {
    async function obtenerContador() {
      try {
        const { data } = await axios(`${URLAPIGENERAL}/sucursales/buscar?codigo=${id}`, config);
        setFormulario(data);
      } catch (error) {
        if (error.response.status === 401) {
          navegacion(`${PATH_AUTH.login}`);
          mensajeSistema("Su inicio de sesion expiro", "error");
        }
        else if (error.response.status === 500) {
          navegacion(`${PATH_PAGE.page500}`);
        } else {
          mensajeSistema("Problemas con la base de datos", "error");
        }
      }
    }
    obtenerContador();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  const Volver = () => {
    navegacion(`/sistema/parametros/sucursal`);
  };
  const Nuevo = () => {
    navegacion(`/sistema/parametros/nuevosucursal`);
  };
  return (
    <>
      <Page title="Sucursal">
        <MenuMantenimiento modo={false} nuevo={() => Nuevo()} grabar={() => Grabar()} volver={() => Volver()} />

        <Fade in style={{ transformOrigin: '0 0 0' }} timeout={1000}>
          <Box sx={{ ml: 3, mr: 3, p: 1, width: '100%' }}>
            <h1>Ingreso de la Sucursal</h1>
          </Box>
        </Fade>
        <Fade in style={{ transformOrigin: '0 0 0' }} timeout={1000}>
          <Card elevation={3} sx={{ ml: 3, mr: 3, mb: 2, p: 1 }}>
            <Box sx={{ width: '100%', p: 2 }}>
              <Grid container spacing={1}>
                <Grid container item xs={12} spacing={1}>
                  <Grid item md={2} sm={3} xs={12}>
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
                      value={formulario.codigo}
                    />
                  </Grid>
                  <Grid item md={3} xs={12} sm={6}>
                    <TextField
                      fullWidth
                      error={error}
                      size="small"
                      type="text"
                      label="Nombre"
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
                </Grid>
                <Grid container item xs={12} spacing={1}>
                  <Grid item md={2} xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      error={error}
                      type="number"
                      label="Telefono"
                      variant="outlined"
                      onChange={(e) => {
                        setFormulario({
                          ...formulario,
                          telefono: e.target.value,
                        });
                      }}
                      value={formulario.telefono}
                      InputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                    />
                  </Grid>
                  <Grid item md={3} xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      error={error}
                      type="number"
                      InputProps={{ inputMode: 'numeric', pattern: '[0-3]*' }}
                      label="Punto de emision"
                      variant="outlined"
                      onChange={(e) => {
                        setFormulario({
                          ...formulario,
                          punto_emision: e.target.value,
                        });
                      }}
                      value={formulario.punto_emision}
                    />
                  </Grid>
                </Grid>
                <Grid container item xs={12} spacing={1}>
                  <Grid item md={2} xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      error={error}
                      label="Celular"
                      type="number"
                      InputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
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
                      error={error}
                      type="text"
                      label="Administrador"
                      variant="outlined"
                      onChange={(e) => {
                        setFormulario({
                          ...formulario,
                          administrador: e.target.value,
                        });
                      }}
                      value={formulario.administrador}
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
                      label="Correo"
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
                      label="Direccion"
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
                  <Grid item md={1.2} xs={12} sm={2}>
                    <FormControlLabel
                      onChange={(e) => {
                        setFormulario({
                          ...formulario,
                          estado: e.target.checked,
                        });
                      }}
                      control={<Checkbox checked={formulario.estado} />}
                      label="Activo"
                    />
                  </Grid>

                  <Grid item md={2} xs={12} sm={2}>
                    <FormControlLabel
                      onChange={(e) => {
                        setFormulario({
                          ...formulario,
                          esmatriz: e.target.checked,
                        });
                      }}
                      control={<Checkbox checked={formulario.esmatriz} />}
                      label="Matriz"
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