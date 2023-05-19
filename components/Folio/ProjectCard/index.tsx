import React from 'react'
import { useState } from 'react'

import Image from 'next/image'

import styles from './ProjectCard.module.css'

import { type Project } from '@/types/Folio'

interface Props {
  project: Project
}

export default function ProjectCard({ project }: Props) {
  return (
    <div className={styles._}>
      <Image
        src={project.image}
        alt={`Screenshot of ${project.title}`}
        fill
        sizes="(max-width: 768px) 50vw,
                33vw"
        style={{
          objectFit: 'cover',
        }}
      />

      <div className={styles.details}>
        <span className={styles.title}>{project.title} ({project.year})</span>
        <div className={styles.tech}>
          <ul>
            {project.tech.map((tech: string, i: number) => {
              return (
                <li key={i}>
                  {tech}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
