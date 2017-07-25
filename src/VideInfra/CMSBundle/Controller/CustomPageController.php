<?php

namespace VideInfra\CMSBundle\Controller;

use Doctrine\ORM\EntityManager;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use VideInfra\CMSBundle\Entity\Page;
use VideInfra\CMSBundle\Form\CustomPageType;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class CustomPageController extends Controller
{
    /**
     * @param Request $request
     * @param Page|null $page
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function editAction(Request $request, Page $page = null)
    {
        $isNew = !$page;
        $repository = $this->get('vig.cms.page.repository');
        $isAdmin = $this->get('security.authorization_checker')
            ->isGranted($this->getParameter('vig.cms.super_admin_role'));

        if (!$page) {
            $page = $repository->create();
            $page->setType(\VideInfra\CMSBundle\PageType\CustomPageType::TYPE);
        }

        $form = $this->createForm(CustomPageType::class, $page, [
            'method' => 'post',
            'is_admin' => $isAdmin
        ]);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {

            /** @var EntityManager $em */
            $em = $this->getDoctrine()->getManager();

            $newOptions = $request->get('option');
            $options = [];
            if (is_array($newOptions)) {
                foreach ($newOptions['name'] as $index => $name) {
                    $value = $newOptions['value'][$index];
                    $options[$name] = $value;
                }
            }
            $page->setOptions($options);

            $em->flush($page);

            if (!$isNew) {

                if ($request->get('update_and_list')) {
                    return $this->redirectToRoute('admin_videinfra_cms_page_list');
                }
                else {
                    return $this->redirectToRoute('admin_videinfra_cms_page_edit', ['id' => $page->getId()]);
                }
            }
            else {
                if ($request->get('create_and_list')) {
                    return $this->redirectToRoute('admin_videinfra_cms_page_list');
                }
                else {
                    return $this->redirectToRoute('admin_videinfra_cms_page_create_type', ['type' => 'custom']);
                }
            }
        }

        return $this->render('VideInfraCMSBundle:Page:create_custom.html.twig', [
            'form' => $form->createView(),
            'page' => $page,
            'isNew' => $isNew,
            'isAdmin' => $isAdmin
        ]);
    }
}