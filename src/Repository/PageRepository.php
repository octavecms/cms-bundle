<?php

namespace VideInfra\CMSBundle\Repository;

use Doctrine\ORM\EntityRepository;
use VideInfra\CMSBundle\Entity\Page;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class PageRepository extends EntityRepository
{
    /**
     * @return Page
     */
    public function create()
    {
        $page = new Page();
        $this->getEntityManager()->persist($page);

        return $page;
    }

    /**
     * @return array
     */
    public function findActive()
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.active = 1')
            ->getQuery()
            ->getResult();
    }
}