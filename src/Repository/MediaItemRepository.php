<?php

namespace Octave\CMSBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Octave\CMSBundle\Entity\MediaItem;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class MediaItemRepository extends EntityRepository
{
    /**
     * @param $category
     * @return mixed
     */
    public function findByCategory($category)
    {
        $queryBuilder = $this->createQueryBuilder('i');

        if (empty($category)) {
            $queryBuilder->andWhere('i.category IS NULL');
        }
        else {
            $queryBuilder
                ->andWhere('i.category = :category')
                ->setParameter('category', $category);
        }

        return $queryBuilder
            ->orderBy('i.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return MediaItem
     */
    public function create()
    {
        $item = new MediaItem();
        $this->getEntityManager()->persist($item);

        return $item;
    }
}