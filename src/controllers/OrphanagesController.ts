import { Request, Response } from "express";
import { getRepository } from "typeorm";
import orphanageView from "../views/orphanages_view";
import * as Yup from "yup";

import Orphanage from "../models/Orphanage";

export default {
  async index(request: Request, response: Response) {
    const orphanagesRepository = getRepository(Orphanage);

    const orphanages = await orphanagesRepository.find({
      relations: ["images"],
    });

    return response.json(orphanageView.renderMany(orphanages));
  },

  async show(request: Request, response: Response) {
    const { id } = request.params;

    const orphanagesRepository = getRepository(Orphanage);

    const orphanage = await orphanagesRepository.findOneOrFail(id, {
      relations: ["images"],
    });

    return response.json(orphanageView.render(orphanage));
  },

  async create(request: Request, response: Response) {
    const {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends,
    } = request.body;

    const orphanagesRepository = getRepository(Orphanage);

    const requestImages = request.files as Express.Multer.File[];

    const images = requestImages.map((image) => {
      return { path: image.filename };
    });

    const data = {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends: open_on_weekends === "true",
      images,
    };

    const schema = Yup.object().shape({
      name: Yup.string().required(),
      latitude: Yup.number().required(),
      longitude: Yup.number().required(),
      about: Yup.string().required().max(300),
      instructions: Yup.string().required(),
      opening_hours: Yup.string().required(),
      open_on_weekends: Yup.boolean().required(),
      images: Yup.array(
        Yup.object().shape({
          path: Yup.string().required(),
        })
      ),
    });

    await schema.validate(data, {
      abortEarly: false,
    });

    const orphanage = orphanagesRepository.create(data);

    await orphanagesRepository.save(orphanage);

    return response.status(201).json(orphanage);
  },
};

//------------------------------------------------
// REQUISIÇÃO / RESPOSTA

// Rota = conjunto
// Recurso = usuário

// Métodos HTTP = GET, POST, PUT, DELETE
//usa-se por semantica:
//GET = Buscar uma informação (lista, item)
//POST = Criando uma informação
//PUT = Editando uma informação
//DELETE = Deletando uma informação

//Query params: http://localhost:3333/users?search=diego&page=2  p/ fazer buscas, filtros, paginação
//Route params: http://localhost:3333/users/1 (identificar um recurso, ID,  p/PUT e DELETE)
//Body: http://localhost:3333/users (objeto com os dados, informações)

// tres formas de lidar com banco de dados dentro de uma aplicação: Driver nativo, Query builder, ORM(Object Relational Mapping)

// {
// 	"name": "Lar das meninas",
// 	"latitude": -25.5039738,
// 	"longitude": -49.2559137,
// 	"about": "Sobre o orfanato",
// 	"instructions": "Venha visitar",
// 	"opening_hours": "Das 8h até 18h",
// 	"open_on_weekends": true
// }
