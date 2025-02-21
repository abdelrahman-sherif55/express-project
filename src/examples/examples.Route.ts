import {Router} from 'express';
import examplesService from "./examples.service";
import examplesValidation from "./examples.validation";

const examplesRoute: Router = Router();

examplesRoute.route('/')
  .get(examplesService.filterExamples, examplesService.getExamples)
  .post(examplesValidation.createExample, examplesService.createExample);

examplesRoute.get('/list', examplesService.getExamplesList);

examplesRoute.route('/:id')
  .get(examplesValidation.getExample, examplesService.getExample)
  .patch(examplesValidation.updateExample, examplesService.updateExample)
  .delete(examplesValidation.deleteExample, examplesService.deleteExample);

export default examplesRoute;