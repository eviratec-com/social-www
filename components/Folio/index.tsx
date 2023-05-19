import React from 'react'
import { useState } from 'react'

import ProjectCard from './ProjectCard'

import styles from './Folio.module.css'

import { type Project } from '@/types/Folio'

export default function Portfolio() {
  const [projects] = useState<Project[]>([{
    title: 'Ministry of Style',
    tech: ['WordPress', 'PHP', 'JavaScript'],
    image: '/folio/2015-mos-www.jpeg',
    description: '',
    year: 2015
  }, {
    title: 'App Builder Prototype',
    tech: ['Node-Webkit (NW.js)', 'Node.js', 'AngularJS'],
    image: '/folio/2017-app-builder.jpeg',
    description: '',
    year: 2017
  }, {
    title: 'Nautilus Replacement',
    tech: ['Node-Webkit (NW.js)', 'Node.js', 'AngularJS'],
    image: '/folio/2017-nautilus-replacement.jpeg',
    description: '',
    year: 2017
  }, {
    title: 'DataStudio',
    tech: ['WordPress', 'PHP'],
    image: '/folio/2018-datastudio-wp.jpeg',
    description: '',
    year: 2018
  }, {
    title: 'Eviratec Life Log',
    tech: ['WordPress', 'PHP'],
    image: '/folio/2018-eviratec-track.jpeg',
    description: '',
    year: 2018
  }, {
    title: 'Eviratec Homepage',
    tech: ['WordPress', 'PHP'],
    image: '/folio/2018-eviratec-www.jpeg',
    description: '',
    year: 2018
  }, {
    title: 'Life Log Web Apps',
    tech: ['Node.js', 'AngularJS', 'MySQL'],
    image: '/folio/2019-log-webapps.jpeg',
    description: '',
    year: 2019
  }, {
    title: 'MoneyLog',
    tech: ['Node.js', 'AngularJS', 'MySQL'],
    image: '/folio/2019-moneylog.jpeg',
    description: '',
    year: 2019
  }, {
    title: 'MyJournal',
    tech: ['Node.js', 'AngularJS', 'MySQL'],
    image: '/folio/2019-myjournal.jpeg',
    description: '',
    year: 2019
  }, {
    title: 'BAS dApp Dev',
    tech: ['Web3', 'React', 'TypeScript', 'Next.js'],
    image: '/folio/2021-bas.jpg',
    description: '',
    year: 2021
  }, {
    title: 'BAS dApp Dev',
    tech: ['Web3', 'React', 'TypeScript', 'Next.js'],
    image: '/folio/2021-bas-lab.jpg',
    description: '',
    year: 2021
  }, {
    title: 'BAS dApp Dev',
    tech: ['Web3', 'React', 'TypeScript', 'Next.js'],
    image: '/folio/2021-bas-genesis.jpg',
    description: '',
    year: 2021
  }].reverse())

  return (
    <div className={styles._}>
      {projects.map((project: Project, i: number) => {
        return (
          <div className={styles.project} key={i}>
            <ProjectCard project={project} />
          </div>
        )
      })}
    </div>
  )
}
